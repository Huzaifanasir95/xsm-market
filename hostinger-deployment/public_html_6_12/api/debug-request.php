<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Prevent infinite loops
if (strpos($_SERVER['REQUEST_URI'], 'debug-request.php') !== false) {
    echo json_encode(['error' => 'Direct access to debug script']);
    exit;
}

echo json_encode([
    'REQUEST_URI' => $_SERVER['REQUEST_URI'],
    'PATH_INFO' => isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : 'not set',
    'QUERY_STRING' => $_SERVER['QUERY_STRING'],
    'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'],
    'parsed_path' => parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH),
    'path_after_api_removal' => str_replace('/api', '', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH)),
    'SERVER_NAME' => $_SERVER['SERVER_NAME'] ?? 'not set',
    'SCRIPT_NAME' => $_SERVER['SCRIPT_NAME'] ?? 'not set'
]);
?>
