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
    // Don't read input for now, just confirm POST is working
    echo json_encode([
        'success' => true,
        'message' => 'POST request received successfully',
        'method' => $_SERVER['REQUEST_METHOD'],
        'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'not set',
        'request_uri' => $_SERVER['REQUEST_URI']
    ]);
} else {
    // GET request
    echo json_encode([
        'message' => 'Simple POST test endpoint',
        'method' => $_SERVER['REQUEST_METHOD'],
        'available_methods' => ['POST']
    ]);
}
?>
