<?php
// Deals API Routes
// Handle all deal-related API endpoints

// Include required dependencies
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/jwt.php';

// Function to get current user from JWT token
function getCurrentUser() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return null;
    }
    
    $token = $matches[1];
    
    try {
        $payload = JWT::verify($token, 'access');
        return $payload;
    } catch (Exception $e) {
        error_log('JWT verification failed: ' . $e->getMessage());
        return null;
    }
}

// Function to create a new deal
function createDeal($data) {
    $pdo = null;
    try {
        // Get database connection
        $pdo = Database::getConnection();
        
        // Validate required fields
        $required_fields = ['seller_id', 'channel_id', 'channel_title', 'channel_price', 'escrow_fee', 'transaction_type', 'buyer_email', 'payment_methods'];
        foreach ($required_fields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                throw new Exception("Missing required field: $field");
            }
        }
        
        // Get current user (buyer)
        $currentUser = getCurrentUser();
        if (!$currentUser) {
            throw new Exception("Authentication required");
        }
        
        $buyer_id = $currentUser['userId'];
        
        // Generate transaction ID
        $transaction_id = 'TXN' . time() . rand(1000, 9999);
        
        // Start transaction
        $pdo->beginTransaction();
        
        // Insert deal
        $stmt = $pdo->prepare("
            INSERT INTO deals (
                transaction_id, buyer_id, seller_id, channel_id, channel_title, 
                channel_price, escrow_fee, transaction_type, buyer_email, 
                buyer_payment_methods, deal_status, buyer_agreed, buyer_agreed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', TRUE, NOW())
        ");
        
        $payment_methods_json = json_encode($data['payment_methods']);
        
        $stmt->execute([
            $transaction_id,
            $buyer_id,
            $data['seller_id'],
            $data['channel_id'],
            $data['channel_title'],
            $data['channel_price'],
            $data['escrow_fee'],
            $data['transaction_type'],
            $data['buyer_email'],
            $payment_methods_json
        ]);
        
        $deal_id = $pdo->lastInsertId();
        
        // Insert payment methods
        foreach ($data['payment_methods'] as $method) {
            $stmt = $pdo->prepare("
                INSERT INTO deal_payment_methods (deal_id, payment_method_id, payment_method_name, payment_method_category)
                VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([
                $deal_id,
                $method['id'],
                $method['name'],
                $method['category']
            ]);
        }
        
        // Insert history record
        $stmt = $pdo->prepare("
            INSERT INTO deal_history (deal_id, action_type, action_by, action_description)
            VALUES (?, 'created', ?, 'Deal created by buyer')
        ");
        $stmt->execute([$deal_id, $buyer_id]);
        
        // Commit transaction
        $pdo->commit();
        
        return [
            'success' => true,
            'deal_id' => $deal_id,
            'transaction_id' => $transaction_id,
            'message' => 'Deal created successfully'
        ];
        
    } catch (Exception $e) {
        if ($pdo && $pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }
}

// Function to get deals for current user
function getDeals($user_id = null) {
    try {
        // Get database connection
        $pdo = Database::getConnection();
        
        if (!$user_id) {
            $currentUser = getCurrentUser();
            if (!$currentUser) {
                throw new Exception("Authentication required");
            }
            $user_id = $currentUser['userId'];
        }
        
        $stmt = $pdo->prepare("
            SELECT d.*, 
                   buyer.username as buyer_username, buyer.email as buyer_email_actual,
                   seller.username as seller_username, seller.email as seller_email
            FROM deals d
            LEFT JOIN users buyer ON d.buyer_id = buyer.id
            LEFT JOIN users seller ON d.seller_id = seller.id
            WHERE d.buyer_id = ? OR d.seller_id = ?
            ORDER BY d.created_at DESC
        ");
        
        $stmt->execute([$user_id, $user_id]);
        $deals = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'success' => true,
            'deals' => $deals
        ];
        
    } catch (Exception $e) {
        throw $e;
    }
}

// Main routing logic
try {
    // Get path and method from globals
    $path = $GLOBALS['path'];
    $method = $GLOBALS['method'];
    
    // Debug logging
    error_log("Deals API - Method: $method, Path: $path");
    
    // Handle POST /deals - Create new deal (ignore query parameters like ?action=create)
    if ($method === 'POST' && ($path === '/deals' || strpos($path, '/deals?') === 0)) {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
            exit;
        }
        
        $result = createDeal($input);
        http_response_code(201);
        echo json_encode($result);
        exit;
    }
    // Handle GET /deals - Get deals for current user
    elseif ($method === 'GET' && $path === '/deals') {
        $result = getDeals();
        http_response_code(200);
        echo json_encode($result);
        exit;
    }
    // Handle GET /deals/{id} - Get specific deal
    elseif ($method === 'GET' && preg_match('/^\/deals\/(\d+)$/', $path, $matches)) {
        $deal_id = $matches[1];
        
        $currentUser = getCurrentUser();
        if (!$currentUser) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            exit;
        }
        
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT d.*, 
                   buyer.username as buyer_username,
                   seller.username as seller_username
            FROM deals d
            LEFT JOIN users buyer ON d.buyer_id = buyer.id
            LEFT JOIN users seller ON d.seller_id = seller.id
            WHERE d.id = ? AND (d.buyer_id = ? OR d.seller_id = ?)
        ");
        
        $stmt->execute([$deal_id, $currentUser['userId'], $currentUser['userId']]);
        $deal = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$deal) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Deal not found']);
            exit;
        }
        
        http_response_code(200);
        echo json_encode(['success' => true, 'deal' => $deal]);
        exit;
    }
    // Handle PUT /deals/{id}/seller-agree - Seller agrees to deal terms
    elseif ($method === 'PUT' && preg_match('/^\/deals\/(\d+)\/seller-agree$/', $path, $matches)) {
        $deal_id = $matches[1];
        
        $currentUser = getCurrentUser();
        if (!$currentUser) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            exit;
        }
        
        try {
            $pdo = Database::getConnection();
            
            // Verify this user is the seller for this deal
            $stmt = $pdo->prepare("SELECT * FROM deals WHERE id = ? AND seller_id = ?");
            $stmt->execute([$deal_id, $currentUser['userId']]);
            $deal = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$deal) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Deal not found or you are not the seller']);
                exit;
            }
            
            if ($deal['seller_agreed']) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'You have already agreed to this deal']);
                exit;
            }
            
            // Update deal to mark seller as agreed
            $pdo->beginTransaction();
            
            $stmt = $pdo->prepare("
                UPDATE deals 
                SET seller_agreed = TRUE, seller_agreed_at = NOW(), deal_status = 'terms_agreed', updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$deal_id]);
            
            // Add history record
            $stmt = $pdo->prepare("
                INSERT INTO deal_history (deal_id, action_type, action_by, action_description)
                VALUES (?, 'seller_agreed', ?, 'Seller agreed to the deal terms and payment methods')
            ");
            $stmt->execute([$deal_id, $currentUser['userId']]);
            
            $pdo->commit();
            
            http_response_code(200);
            echo json_encode([
                'success' => true, 
                'message' => 'Successfully agreed to deal terms',
                'deal_status' => 'terms_agreed'
            ]);
            exit;
            
        } catch (Exception $e) {
            if (isset($pdo) && $pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log('Seller agree error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
            exit;
        }
    }
    // Handle GET /deals/seller - Get deals where current user is the seller
    elseif ($method === 'GET' && $path === '/deals/seller') {
        try {
            $currentUser = getCurrentUser();
            if (!$currentUser) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Authentication required']);
                exit;
            }
            
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("
                SELECT d.*, 
                       buyer.username as buyer_username, buyer.email as buyer_email_actual,
                       dpm.payment_method_id, dpm.payment_method_name, dpm.payment_method_category
                FROM deals d
                LEFT JOIN users buyer ON d.buyer_id = buyer.id
                LEFT JOIN deal_payment_methods dpm ON d.id = dpm.deal_id
                WHERE d.seller_id = ?
                ORDER BY d.created_at DESC
            ");
            
            $stmt->execute([$currentUser['userId']]);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Group payment methods by deal
            $deals = [];
            foreach ($results as $row) {
                $deal_id = $row['id'];
                if (!isset($deals[$deal_id])) {
                    $deals[$deal_id] = [
                        'id' => $row['id'],
                        'transaction_id' => $row['transaction_id'],
                        'buyer_id' => $row['buyer_id'],
                        'seller_id' => $row['seller_id'],
                        'channel_id' => $row['channel_id'],
                        'channel_title' => $row['channel_title'],
                        'channel_price' => $row['channel_price'],
                        'escrow_fee' => $row['escrow_fee'],
                        'transaction_type' => $row['transaction_type'],
                        'buyer_payment_methods' => $row['buyer_payment_methods'],
                        'seller_agreed' => $row['seller_agreed'],
                        'seller_agreed_at' => $row['seller_agreed_at'],
                        'buyer_agreed' => $row['buyer_agreed'],
                        'buyer_agreed_at' => $row['buyer_agreed_at'],
                        'deal_status' => $row['deal_status'],
                        'created_at' => $row['created_at'],
                        'updated_at' => $row['updated_at'],
                        'buyer_username' => $row['buyer_username'],
                        'payment_methods' => []
                    ];
                }
                
                if ($row['payment_method_id']) {
                    $deals[$deal_id]['payment_methods'][] = [
                        'id' => $row['payment_method_id'],
                        'name' => $row['payment_method_name'],
                        'category' => $row['payment_method_category']
                    ];
                }
            }
            
            $deals = array_values($deals);
            
            http_response_code(200);
            echo json_encode(['success' => true, 'deals' => $deals]);
            exit;
            
        } catch (Exception $e) {
            error_log('Get seller deals error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
            exit;
        }
    }
    else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Deals endpoint not found: ' . $path]);
        exit;
    }
    
} catch (Exception $e) {
    error_log('Deals API Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit;
}
?>
