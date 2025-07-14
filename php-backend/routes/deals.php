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
    // Handle GET /deals/buyer - Get deals where current user is the buyer
    elseif ($method === 'GET' && $path === '/deals/buyer') {
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
                       seller.username as seller_username, seller.email as seller_email_actual,
                       dpm.payment_method_id, dpm.payment_method_name, dpm.payment_method_category
                FROM deals d
                LEFT JOIN users seller ON d.seller_id = seller.id
                LEFT JOIN deal_payment_methods dpm ON d.id = dpm.deal_id
                WHERE d.buyer_id = ?
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
                        'transaction_fee_paid' => $row['transaction_fee_paid'],
                        'transaction_fee_paid_at' => $row['transaction_fee_paid_at'],
                        'transaction_fee_paid_by' => $row['transaction_fee_paid_by'],
                        'transaction_fee_payment_method' => $row['transaction_fee_payment_method'],
                        'created_at' => $row['created_at'],
                        'updated_at' => $row['updated_at'],
                        'seller_username' => $row['seller_username'],
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
            error_log('Get buyer deals error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
            exit;
        }
    }
    // Handle POST /deals/{id}/pay-transaction-fee - Pay transaction fee
    elseif ($method === 'POST' && preg_match('/^\/deals\/(\d+)\/pay-transaction-fee$/', $path, $matches)) {
        $deal_id = $matches[1];
        
        $currentUser = getCurrentUser();
        if (!$currentUser) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            exit;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
            exit;
        }
        
        if (!isset($input['payment_method']) || !isset($input['payer_type'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing payment_method or payer_type']);
            exit;
        }
        
        $payment_method = $input['payment_method']; // 'stripe' or 'crypto'
        $payer_type = $input['payer_type']; // 'buyer' or 'seller'
        
        if (!in_array($payment_method, ['stripe', 'crypto'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid payment method']);
            exit;
        }
        
        if (!in_array($payer_type, ['buyer', 'seller'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid payer type']);
            exit;
        }
        
        try {
            $pdo = Database::getConnection();
            
            // Verify this user is either buyer or seller for this deal
            $stmt = $pdo->prepare("SELECT * FROM deals WHERE id = ? AND (buyer_id = ? OR seller_id = ?)");
            $stmt->execute([$deal_id, $currentUser['userId'], $currentUser['userId']]);
            $deal = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$deal) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Deal not found or access denied']);
                exit;
            }
            
            // Check if both parties have agreed to terms
            if (!$deal['buyer_agreed'] || !$deal['seller_agreed']) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Both parties must agree to terms before payment']);
                exit;
            }
            
            // Check if transaction fee is already paid
            if ($deal['transaction_fee_paid']) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Transaction fee has already been paid']);
                exit;
            }
            
            // Verify payer type matches current user role
            $is_buyer = ($deal['buyer_id'] == $currentUser['userId']);
            $is_seller = ($deal['seller_id'] == $currentUser['userId']);
            
            if (($payer_type === 'buyer' && !$is_buyer) || ($payer_type === 'seller' && !$is_seller)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Payer type does not match your role in this deal']);
                exit;
            }
            
            // TODO: Integrate with actual payment processors (Stripe/Crypto)
            // For now, we'll simulate successful payment
            
            // Update deal with payment information
            $pdo->beginTransaction();
            
            $stmt = $pdo->prepare("
                UPDATE deals 
                SET transaction_fee_paid = TRUE, 
                    transaction_fee_paid_at = NOW(), 
                    transaction_fee_paid_by = ?,
                    transaction_fee_payment_method = ?,
                    deal_status = 'fee_paid',
                    updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$payer_type, $payment_method, $deal_id]);
            
            // Add history record
            $stmt = $pdo->prepare("
                INSERT INTO deal_history (deal_id, action_type, action_by, action_description)
                VALUES (?, 'fee_paid', ?, ?)
            ");
            $action_description = "Transaction fee paid via $payment_method by $payer_type";
            $stmt->execute([$deal_id, $currentUser['userId'], $action_description]);
            
            // After fee payment, send agent email to seller via chat
            try {
                // Get admin email from environment
                $admin_email = $_ENV['admin_email'] ?? 'rebirthcar63@gmail.com';
                
                // Find the chat for this deal (based on seller and channel)
                $stmt = $pdo->prepare("
                    SELECT c.id as chat_id FROM chats c
                    INNER JOIN chat_participants cp1 ON c.id = cp1.chatId
                    INNER JOIN chat_participants cp2 ON c.id = cp2.chatId
                    WHERE c.type = 'ad_inquiry'
                    AND cp1.userId = ? AND cp1.isActive = 1
                    AND cp2.userId = ? AND cp2.isActive = 1
                    AND cp1.chatId = cp2.chatId
                    LIMIT 1
                ");
                $stmt->execute([$deal['buyer_id'], $deal['seller_id']]);
                $chat = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($chat) {
                    // Send automatic message with agent email
                    $message_content = "🎉 Great news! The transaction fee has been paid and your deal is now proceeding to the next step.\n\n📧 **Agent Email for Account Rights**: {$admin_email}\n\nPlease add this email as a manager/collaborator to your account so our agent can verify everything and facilitate the secure transfer. Once you've given rights to this email, please confirm below.\n\n⚠️ **Important**: Only give manager/collaborator access, NOT ownership. Our agent will handle the ownership transfer securely.";
                    
                    // Insert system message
                    $stmt = $pdo->prepare("
                        INSERT INTO messages (chatId, senderId, content, messageType, isRead, createdAt, updatedAt)
                        VALUES (?, 1, ?, 'system', 0, NOW(), NOW())
                    ");
                    $stmt->execute([$chat['chat_id'], $message_content]);
                    
                    // Update chat last message
                    $stmt = $pdo->prepare("
                        UPDATE chats SET lastMessage = ?, lastMessageTime = NOW(), updatedAt = NOW()
                        WHERE id = ?
                    ");
                    $stmt->execute(['System: Agent email provided for account access', $chat['chat_id']]);
                }
                
                // Update deal with agent email sent status
                $stmt = $pdo->prepare("
                    UPDATE deals 
                    SET agent_email_sent = TRUE,
                        agent_email_sent_at = NOW(),
                        deal_status = 'agent_access_pending',
                        updated_at = NOW()
                    WHERE id = ?
                ");
                $stmt->execute([$deal_id]);
                
                // Add history record for agent email sent
                $stmt = $pdo->prepare("
                    INSERT INTO deal_history (deal_id, action_type, action_by, action_description)
                    VALUES (?, 'agent_email_sent', 1, ?)
                ");
                $agent_email_description = "Agent email ({$admin_email}) sent to seller for account access";
                $stmt->execute([$deal_id, $agent_email_description]);
                
            } catch (Exception $e) {
                error_log('Error sending agent email: ' . $e->getMessage());
                // Don't fail the payment if agent email fails
            }
            
            $pdo->commit();
            
            http_response_code(200);
            echo json_encode([
                'success' => true, 
                'message' => 'Transaction fee paid successfully. Agent email has been sent to the seller.',
                'deal_status' => 'agent_access_pending',
                'payment_method' => $payment_method,
                'paid_by' => $payer_type,
                'agent_email_sent' => true
            ]);
            exit;
            
        } catch (Exception $e) {
            if (isset($pdo) && $pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log('Transaction fee payment error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
            exit;
        }
    }
    // Handle POST /deals/{id}/confirm-rights - Seller confirms they gave rights to agent
    elseif ($method === 'POST' && preg_match('/^\/deals\/(\d+)\/confirm-rights$/', $path, $matches)) {
        $deal_id = $matches[1];
        
        $currentUser = getCurrentUser();
        if (!$currentUser) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            exit;
        }
        
        try {
            $pdo = Database::getConnection();
            
            // Get deal and verify seller access
            $stmt = $pdo->prepare("
                SELECT * FROM deals 
                WHERE id = ? AND seller_id = ?
            ");
            $stmt->execute([$deal_id, $currentUser['userId']]);
            $deal = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$deal) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Deal not found or access denied']);
                exit;
            }
            
            // Check if transaction fee is paid and agent email was sent
            if (!$deal['transaction_fee_paid'] || !$deal['agent_email_sent']) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Transaction fee must be paid and agent email sent before confirming rights']);
                exit;
            }
            
            // Check if rights already confirmed
            if ($deal['seller_gave_rights']) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Rights have already been confirmed']);
                exit;
            }
            
            $pdo->beginTransaction();
            
            // Get platform type from channel_title or set default
            $platform_type = 'unknown';
            if (stripos($deal['channel_title'], 'youtube') !== false || stripos($deal['channel_title'], 'yt') !== false) {
                $platform_type = 'youtube';
            } elseif (stripos($deal['channel_title'], 'tiktok') !== false) {
                $platform_type = 'tiktok';
            } elseif (stripos($deal['channel_title'], 'instagram') !== false) {
                $platform_type = 'instagram';
            } elseif (stripos($deal['channel_title'], 'twitter') !== false) {
                $platform_type = 'twitter';
            } elseif (stripos($deal['channel_title'], 'facebook') !== false) {
                $platform_type = 'facebook';
            }
            
            // Determine if timer is needed (only YouTube requires 7-day timer)
            $requires_timer = ($platform_type === 'youtube');
            $new_status = $requires_timer ? 'waiting_promotion_timer' : 'agent_access_confirmed';
            
            // Calculate timer expiry (7 days for YouTube)
            $timer_expires_at = $requires_timer ? date('Y-m-d H:i:s', strtotime('+7 days')) : null;
            
            // Update deal with rights confirmation and timer logic
            if ($requires_timer) {
                $stmt = $pdo->prepare("
                    UPDATE deals 
                    SET seller_gave_rights = TRUE,
                        seller_gave_rights_at = NOW(),
                        platform_type = ?,
                        rights_timer_started_at = NOW(),
                        rights_timer_expires_at = ?,
                        deal_status = ?,
                        updated_at = NOW()
                    WHERE id = ?
                ");
                $stmt->execute([$platform_type, $timer_expires_at, $new_status, $deal_id]);
            } else {
                $stmt = $pdo->prepare("
                    UPDATE deals 
                    SET seller_gave_rights = TRUE,
                        seller_gave_rights_at = NOW(),
                        platform_type = ?,
                        timer_completed = TRUE,
                        deal_status = ?,
                        updated_at = NOW()
                    WHERE id = ?
                ");
                $stmt->execute([$platform_type, $new_status, $deal_id]);
            }
            
            // Add history record
            $stmt = $pdo->prepare("
                INSERT INTO deal_history (deal_id, action_type, action_by, action_description)
                VALUES (?, 'seller_gave_rights', ?, ?)
            ");
            $action_description = "Seller confirmed giving rights to agent";
            $stmt->execute([$deal_id, $currentUser['userId'], $action_description]);
            
            // Add timer history if needed
            if ($requires_timer) {
                $stmt = $pdo->prepare("
                    INSERT INTO deal_history (deal_id, action_type, action_by, action_description)
                    VALUES (?, 'timer_started', ?, ?)
                ");
                $timer_description = "7-day YouTube promotion timer started. Seller must wait 7 days before promoting agent to primary owner.";
                $stmt->execute([$deal_id, $currentUser['userId'], $timer_description]);
            }
            
            // Send confirmation message to chat
            try {
                // Find the chat for this deal
                $stmt = $pdo->prepare("
                    SELECT c.id as chat_id FROM chats c
                    INNER JOIN chat_participants cp1 ON c.id = cp1.chatId
                    INNER JOIN chat_participants cp2 ON c.id = cp2.chatId
                    WHERE c.type = 'ad_inquiry'
                    AND cp1.userId = ? AND cp1.isActive = 1
                    AND cp2.userId = ? AND cp2.isActive = 1
                    AND cp1.chatId = cp2.chatId
                    LIMIT 1
                ");
                $stmt->execute([$deal['buyer_id'], $deal['seller_id']]);
                $chat = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($chat) {
                    // Create different messages based on platform and timer requirement
                    if ($requires_timer) {
                        $message_content = "✅ **Rights Confirmed - YouTube Timer Started!**\n\n" .
                            "The seller has confirmed giving account access to our agent.\n\n" .
                            "⏰ **Important**: Since this is a YouTube channel, you must wait **7 days** before promoting the agent to Primary Owner. This is YouTube's standard requirement.\n\n" .
                            "📅 **Timer expires on**: " . date('M j, Y \a\t g:i A', strtotime($timer_expires_at)) . "\n\n" .
                            "**Next Steps:**\n" .
                            "1. Agent will verify account access\n" .
                            "2. Wait for the 7-day timer to complete\n" .
                            "3. You'll receive a notification when it's time to promote the agent\n" .
                            "4. Promote agent from Owner to Primary Owner\n" .
                            "5. Confirm promotion to complete the transfer\n\n" .
                            "🔔 You will be notified when the timer is complete and you can proceed with the promotion.";
                    } else {
                        $platform_name = ucfirst($platform_type);
                        $message_content = "✅ **Rights Confirmed - Ready to Proceed!**\n\n" .
                            "The seller has confirmed giving account access to our agent.\n\n" .
                            "✨ **Great news**: {$platform_name} channels don't require a waiting period. The transfer can proceed immediately!\n\n" .
                            "**Next Steps:**\n" .
                            "1. Agent will verify account access\n" .
                            "2. Promote agent to Primary Owner (you can do this now)\n" .
                            "3. Confirm promotion to complete the transfer\n\n" .
                            "🚀 You can now proceed with promoting the agent to Primary Owner when ready.";
                    }
                    
                    // Insert system message
                    $stmt = $pdo->prepare("
                        INSERT INTO messages (chatId, senderId, content, messageType, isRead, createdAt, updatedAt)
                        VALUES (?, 1, ?, 'system', 0, NOW(), NOW())
                    ");
                    $stmt->execute([$chat['chat_id'], $message_content]);
                    
                    // Update chat last message
                    $stmt = $pdo->prepare("
                        UPDATE chats SET lastMessage = ?, lastMessageTime = NOW(), updatedAt = NOW()
                        WHERE id = ?
                    ");
                    $stmt->execute(['System: Seller confirmed agent access rights', $chat['chat_id']]);
                }
            } catch (Exception $e) {
                error_log('Error sending rights confirmation message: ' . $e->getMessage());
                // Don't fail the confirmation if message fails
            }
            
            $pdo->commit();
            
            http_response_code(200);
            echo json_encode([
                'success' => true, 
                'message' => 'Rights confirmation successful. The agent will now verify the account.',
                'deal_status' => 'agent_access_confirmed',
                'seller_gave_rights' => true
            ]);
            exit;
            
        } catch (Exception $e) {
            if (isset($pdo) && $pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log('Rights confirmation error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
            exit;
        }
    }
    // Handle POST /deals/{id}/confirm-primary-owner - Seller confirms they made agent primary owner
    elseif ($method === 'POST' && preg_match('/^\/deals\/(\d+)\/confirm-primary-owner$/', $path, $matches)) {
        $deal_id = $matches[1];
        
        $currentUser = getCurrentUser();
        if (!$currentUser) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            exit;
        }
        
        try {
            $pdo = Database::getConnection();
            
            // Get deal and verify seller access
            $stmt = $pdo->prepare("
                SELECT * FROM deals 
                WHERE id = ? AND seller_id = ?
            ");
            $stmt->execute([$deal_id, $currentUser['userId']]);
            $deal = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$deal) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Deal not found or access denied']);
                exit;
            }
            
            // Check if seller has given rights
            if (!$deal['seller_gave_rights']) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'You must first confirm giving rights to the agent']);
                exit;
            }
            
            // Check if primary owner already confirmed
            if ($deal['seller_made_primary_owner']) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Primary owner promotion has already been confirmed']);
                exit;
            }
            
            // For YouTube, check if timer is complete
            if ($deal['platform_type'] === 'youtube') {
                $current_time = time();
                $timer_expires = strtotime($deal['rights_timer_expires_at']);
                
                if ($current_time < $timer_expires) {
                    $remaining_time = $timer_expires - $current_time;
                    $remaining_days = ceil($remaining_time / (24 * 60 * 60));
                    http_response_code(400);
                    echo json_encode([
                        'success' => false, 
                        'message' => "You must wait {$remaining_days} more day(s) before promoting the agent to primary owner. Timer expires on " . date('M j, Y \a\t g:i A', $timer_expires),
                        'timer_expires_at' => $deal['rights_timer_expires_at'],
                        'remaining_seconds' => $remaining_time
                    ]);
                    exit;
                }
            }
            
            $pdo->beginTransaction();
            
            // Update deal with primary owner confirmation
            $stmt = $pdo->prepare("
                UPDATE deals 
                SET seller_made_primary_owner = TRUE,
                    seller_made_primary_owner_at = NOW(),
                    timer_completed = TRUE,
                    deal_status = 'promotion_timer_complete',
                    updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$deal_id]);
            
            // Add history record
            $stmt = $pdo->prepare("
                INSERT INTO deal_history (deal_id, action_type, action_by, action_description)
                VALUES (?, 'seller_made_primary_owner', ?, ?)
            ");
            $action_description = "Seller confirmed promoting agent to primary owner";
            $stmt->execute([$deal_id, $currentUser['userId'], $action_description]);
            
            // Send confirmation message to chat
            try {
                // Find the chat for this deal
                $stmt = $pdo->prepare("
                    SELECT c.id as chat_id FROM chats c
                    INNER JOIN chat_participants cp1 ON c.id = cp1.chatId
                    INNER JOIN chat_participants cp2 ON c.id = cp2.chatId
                    WHERE c.type = 'ad_inquiry'
                    AND cp1.userId = ? AND cp1.isActive = 1
                    AND cp2.userId = ? AND cp2.isActive = 1
                    AND cp1.chatId = cp2.chatId
                    LIMIT 1
                ");
                $stmt->execute([$deal['buyer_id'], $deal['seller_id']]);
                $chat = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($chat) {
                    $platform_name = ucfirst($deal['platform_type']);
                    $message_content = "🎉 **Primary Owner Promotion Confirmed!**\n\n" .
                        "The seller has successfully promoted our agent to Primary Owner of the {$platform_name} channel.\n\n" .
                        "✅ **Channel transfer is now complete!**\n\n" .
                        "**What happens next:**\n" .
                        "1. Agent will verify primary ownership status\n" .
                        "2. Final account details will be prepared\n" .
                        "3. Buyer will receive full account access\n" .
                        "4. Escrow payment will be processed\n\n" .
                        "🎯 The deal is now in its final stages. Thank you for your cooperation!";
                    
                    $stmt = $pdo->prepare("
                        INSERT INTO messages (chatId, senderId, content, messageType, createdAt)
                        VALUES (?, 'system', ?, 'system', NOW())
                    ");
                    $stmt->execute([$chat['chat_id'], $message_content]);
                    
                    // Update chat last message
                    $stmt = $pdo->prepare("
                        UPDATE chats SET lastMessage = ?, lastMessageTime = NOW(), updatedAt = NOW()
                        WHERE id = ?
                    ");
                    $stmt->execute(['System: Primary owner promotion confirmed', $chat['chat_id']]);
                }
            } catch (Exception $e) {
                error_log('Error sending primary owner confirmation message: ' . $e->getMessage());
                // Don't fail the confirmation if message fails
            }
            
            $pdo->commit();
            
            http_response_code(200);
            echo json_encode([
                'success' => true, 
                'message' => 'Primary owner promotion confirmed successfully. The channel transfer is now complete!',
                'deal_status' => 'promotion_timer_complete',
                'seller_made_primary_owner' => true
            ]);
            exit;
            
        } catch (Exception $e) {
            if (isset($pdo) && $pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log('Primary owner confirmation error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
            exit;
        }
    }
    // Handle GET /deals/{id}/status - Get deal status and timer information
    elseif ($method === 'GET' && preg_match('/^\/deals\/(\d+)\/status$/', $path, $matches)) {
        $deal_id = $matches[1];
        
        $currentUser = getCurrentUser();
        if (!$currentUser) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            exit;
        }
        
        try {
            $pdo = Database::getConnection();
            
            // Get deal and verify user access (either buyer or seller)
            $stmt = $pdo->prepare("
                SELECT * FROM deals 
                WHERE id = ? AND (seller_id = ? OR buyer_id = ?)
            ");
            $stmt->execute([$deal_id, $currentUser['userId'], $currentUser['userId']]);
            $deal = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$deal) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Deal not found or access denied']);
                exit;
            }
            
            $response = [
                'success' => true,
                'deal_id' => $deal['id'],
                'deal_status' => $deal['deal_status'],
                'platform_type' => $deal['platform_type'],
                'transaction_fee_paid' => (bool)$deal['transaction_fee_paid'],
                'transaction_fee_paid_by' => $deal['transaction_fee_paid_by'],
                'seller_gave_rights' => (bool)$deal['seller_gave_rights'],
                'seller_made_primary_owner' => (bool)$deal['seller_made_primary_owner'],
                'timer_completed' => (bool)$deal['timer_completed'],
                'rights_timer_started_at' => $deal['rights_timer_started_at'],
                'rights_timer_expires_at' => $deal['rights_timer_expires_at'],
                'seller_made_primary_owner_at' => $deal['seller_made_primary_owner_at'],
                'is_seller' => $deal['seller_id'] == $currentUser['userId'],
                'is_buyer' => $deal['buyer_id'] == $currentUser['userId']
            ];
            
            // Add timer calculation for active timers
            if ($deal['rights_timer_expires_at'] && !$deal['timer_completed']) {
                $current_time = time();
                $timer_expires = strtotime($deal['rights_timer_expires_at']);
                $remaining_time = $timer_expires - $current_time;
                
                $response['timer_remaining_seconds'] = max(0, $remaining_time);
                $response['timer_remaining_days'] = max(0, ceil($remaining_time / (24 * 60 * 60)));
                $response['timer_expired'] = $remaining_time <= 0;
                
                if ($remaining_time > 0) {
                    $response['timer_expires_formatted'] = date('M j, Y \a\t g:i A', $timer_expires);
                }
            }
            
            http_response_code(200);
            echo json_encode($response);
            exit;
            
        } catch (Exception $e) {
            error_log('Deal status error: ' . $e->getMessage());
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
