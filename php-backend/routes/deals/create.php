<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../middleware/AuthMiddleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    // Get the JSON input
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (!$data) {
        throw new Exception('Invalid JSON data');
    }
    
    // Validate required fields
    $required = ['sellerId', 'channelTitle', 'channelPrice', 'escrowFee', 'paymentMethods', 'buyerEmail', 'transactionId'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }
    
    // Get authenticated user
    $user = AuthMiddleware::authenticate();
    if (!$user) {
        throw new Exception('Authentication required');
    }
    
    $buyerId = $user['id'];
    
    // Don't allow users to buy from themselves
    if ($buyerId == $data['sellerId']) {
        throw new Exception('You cannot purchase from yourself');
    }
    
    // Check if transaction ID already exists
    $pdo = Database::getConnection();
    $checkStmt = $pdo->prepare("SELECT id FROM deals WHERE transactionId = ?");
    $checkStmt->execute([$data['transactionId']]);
    if ($checkStmt->fetch()) {
        throw new Exception('Transaction ID already exists');
    }
    
    // Insert deal into database
    $stmt = $pdo->prepare("
        INSERT INTO deals (
            transactionId, buyerId, sellerId, channelTitle, channelPrice, 
            escrowFee, escrowFeePercent, transactionType, buyerEmail, 
            paymentMethods, selectedPaymentMethods, status, buyerAgreedToTerms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 1)
    ");
    
    $paymentMethodsJson = json_encode($data['paymentMethods'] ?? []);
    $selectedMethodsJson = json_encode($data['selectedPaymentMethods'] ?? []);
    
    $result = $stmt->execute([
        $data['transactionId'],
        $buyerId,
        $data['sellerId'],
        $data['channelTitle'],
        $data['channelPrice'],
        $data['escrowFee'],
        $data['escrowFeePercent'] ?? 4.80,
        $data['transactionType'] ?? 'safest',
        $data['buyerEmail'],
        $paymentMethodsJson,
        $selectedMethodsJson
    ]);
    
    if (!$result) {
        throw new Exception('Failed to create deal');
    }
    
    $dealId = $pdo->lastInsertId();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Deal created successfully',
        'dealId' => $dealId,
        'transactionId' => $data['transactionId'],
        'status' => 'pending'
    ]);
    
} catch (Exception $e) {
    error_log("Deal creation error: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
