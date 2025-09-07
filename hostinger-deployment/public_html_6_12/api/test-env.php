<?php
// Test environment variables and basic functionality
header('Content-Type: application/json');

// Load environment variables
require_once __DIR__ . '/config/env.php';

$response = [
    'status' => 'ok',
    'timestamp' => date('Y-m-d H:i:s'),
    'environment' => [
        'PHP_ENV' => getenv('PHP_ENV'),
        'DB_HOST' => getenv('DB_HOST'),
        'DB_NAME' => getenv('DB_NAME'),
        'DB_USER' => getenv('DB_USER'),
        'DB_PASSWORD' => getenv('DB_PASSWORD') ? 'SET' : 'NOT SET',
        'ADMIN_EMAIL' => getenv('ADMIN_EMAIL'),
        'FRONTEND_URL' => getenv('FRONTEND_URL'),
        'RECAPTCHA_SITE_KEY' => getenv('RECAPTCHA_SITE_KEY') ? 'SET' : 'NOT SET',
        'RECAPTCHA_SECRET_KEY' => getenv('RECAPTCHA_SECRET_KEY') ? 'SET' : 'NOT SET'
    ],
    'database_test' => 'checking...'
];

// Test database connection
try {
    require_once __DIR__ . '/config/database.php';
    $pdo = Database::getConnection();
    $response['database_test'] = 'SUCCESS - Connected to database';
    $response['database_info'] = [
        'host' => getenv('DB_HOST'),
        'database' => getenv('DB_NAME')
    ];
} catch (Exception $e) {
    $response['database_test'] = 'FAILED - ' . $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>
