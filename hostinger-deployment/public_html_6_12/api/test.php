<?php
// Simple test script to debug API issues on Hostinger
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

echo json_encode([
    'status' => 'ok',
    'message' => 'API Test Script Working',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion(),
    'server_info' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'request_method' => $_SERVER['REQUEST_METHOD'],
    'request_uri' => $_SERVER['REQUEST_URI'],
    'env_check' => [
        'DB_HOST' => getenv('DB_HOST') ? 'Set' : 'Not Set',
        'DB_NAME' => getenv('DB_NAME') ? 'Set' : 'Not Set',
        'DB_USER' => getenv('DB_USER') ? 'Set' : 'Not Set',
        'PHP_ENV' => getenv('PHP_ENV') ?: 'Not Set'
    ]
]);
?>
