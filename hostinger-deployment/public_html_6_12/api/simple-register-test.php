<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Simulate a registration endpoint
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (isset($input['username']) && isset($input['email'])) {
        // Success response
        echo json_encode([
            'success' => true,
            'message' => 'Registration test successful',
            'received_data' => $input,
            'server_info' => [
                'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'],
                'REQUEST_URI' => $_SERVER['REQUEST_URI'],
                'CONTENT_TYPE' => $_SERVER['CONTENT_TYPE'] ?? 'not set'
            ]
        ]);
    } else {
        // Error response
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Missing required fields',
            'received_data' => $input
        ]);
    }
} else {
    // GET request
    echo json_encode([
        'message' => 'Simple register test endpoint',
        'method' => $_SERVER['REQUEST_METHOD'],
        'available_methods' => ['POST']
    ]);
}
?>
