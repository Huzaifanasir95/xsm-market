<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://xsmmarket.com');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Test basic PHP functionality
$response = [
    'status' => 'success',
    'message' => 'Backend is working!',
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => [
        'php_version' => phpversion(),
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
        'request_method' => $_SERVER['REQUEST_METHOD'],
        'request_uri' => $_SERVER['REQUEST_URI'],
        'http_host' => $_SERVER['HTTP_HOST'] ?? 'Unknown'
    ]
];

// Test environment variables
$env_test = [
    'DB_HOST' => getenv('DB_HOST') ? 'Set' : 'Missing',
    'DB_NAME' => getenv('DB_NAME') ? 'Set' : 'Missing',
    'GMAIL_USER' => getenv('GMAIL_USER') ? 'Set' : 'Missing',
    'PHP_ENV' => getenv('PHP_ENV') ?: 'Not set',
];

$response['environment'] = $env_test;

// Test database connection
try {
    require_once __DIR__ . '/config/env.php';
    
    $host = $_ENV['DB_HOST'] ?? 'localhost';
    $dbname = $_ENV['DB_NAME'] ?? '';
    $username = $_ENV['DB_USER'] ?? '';
    $password = $_ENV['DB_PASSWORD'] ?? '';
    
    if ($dbname && $username) {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Test query
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $response['database'] = [
            'status' => 'connected',
            'user_count' => $result['count']
        ];
    } else {
        $response['database'] = [
            'status' => 'missing_credentials'
        ];
    }
} catch (Exception $e) {
    $response['database'] = [
        'status' => 'error',
        'message' => $e->getMessage()
    ];
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>