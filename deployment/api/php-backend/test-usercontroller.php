<?php
// Direct test of UserController functionality
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/controllers/UserController.php';

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    $userController = new UserController();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'UserController loaded successfully',
        'timestamp' => date('Y-m-d H:i:s'),
        'class_methods' => get_class_methods($userController)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to load UserController: ' . $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>
