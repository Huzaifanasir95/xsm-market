<?php
// Database connection test for production
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Load environment variables
if (file_exists('.env')) {
    $lines = file('.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            putenv(trim($key) . '=' . trim($value));
        }
    }
}

$response = [
    'status' => 'testing',
    'timestamp' => date('Y-m-d H:i:s'),
    'environment' => [
        'PHP_ENV' => getenv('PHP_ENV') ?: 'not set',
        'DB_HOST' => getenv('DB_HOST') ?: 'not set',
        'DB_NAME' => getenv('DB_NAME') ?: 'not set',
        'DB_USER' => getenv('DB_USER') ?: 'not set',
        'DB_PASSWORD' => getenv('DB_PASSWORD') ? 'set' : 'not set'
    ]
];

// Test database connection
try {
    $host = getenv('DB_HOST');
    $dbname = getenv('DB_NAME');
    $username = getenv('DB_USER');
    $password = getenv('DB_PASSWORD');
    
    if (!$host || !$dbname || !$username) {
        throw new Exception('Database credentials missing');
    }
    
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);
    
    // Test query
    $stmt = $pdo->query('SELECT COUNT(*) as user_count FROM users');
    $result = $stmt->fetch();
    
    $response['database'] = [
        'status' => 'connected',
        'user_count' => $result['user_count']
    ];
    
} catch (Exception $e) {
    $response['database'] = [
        'status' => 'error',
        'message' => $e->getMessage()
    ];
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>
