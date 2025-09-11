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

// For now, just return a simple test response for POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get content type
    $contentType = $_SERVER['CONTENT_TYPE'] ?? 'unknown';
    
    // Try to get some basic info without reading php://input
    echo json_encode([
        'success' => true,
        'message' => 'Registration endpoint reached',
        'method' => $_SERVER['REQUEST_METHOD'],
        'content_type' => $contentType,
        'post_data_available' => !empty($_POST),
        'post_data' => $_POST,
        'query_string' => $_SERVER['QUERY_STRING'] ?? '',
        'request_uri' => $_SERVER['REQUEST_URI'],
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} else {
    echo json_encode([
        'message' => 'Test registration endpoint',
        'method' => $_SERVER['REQUEST_METHOD'],
        'supported_methods' => ['POST']
    ]);
}
?>
