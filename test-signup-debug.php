<?php
// Test script to debug signup functionality
require_once 'php-backend/config/database.php';
require_once 'php-backend/controllers/AuthController.php';

// Test database connection first
echo "=== Testing Database Connection ===\n";
try {
    $db = new Database();
    $connection = $db->getConnection();
    echo "✅ Database connection successful\n";
    
    // Test if users table exists
    $stmt = $connection->query("SHOW TABLES LIKE 'users'");
    if ($stmt->rowCount() > 0) {
        echo "✅ Users table exists\n";
    } else {
        echo "❌ Users table does not exist\n";
    }
    
    // Check users table structure
    $stmt = $connection->query("DESCRIBE users");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Users table columns:\n";
    foreach ($columns as $column) {
        echo "  - {$column['Field']} ({$column['Type']})\n";
    }
    
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
}

echo "\n=== Testing AuthController ===\n";
try {
    $authController = new AuthController();
    echo "✅ AuthController instantiated successfully\n";
} catch (Exception $e) {
    echo "❌ AuthController instantiation failed: " . $e->getMessage() . "\n";
}

echo "\n=== Testing Registration Endpoint ===\n";
// Simulate a POST request to the register endpoint
$_SERVER['REQUEST_METHOD'] = 'POST';
$testData = [
    'username' => 'testuser123',
    'email' => 'test@example.com',
    'password' => 'password123',
    'recaptchaToken' => 'test-token'
];

// Mock the input
$GLOBALS['HTTP_RAW_POST_DATA'] = json_encode($testData);

echo "Test data: " . json_encode($testData) . "\n";

// Capture output
ob_start();
try {
    // Mock the file_get_contents for php://input
    if (!function_exists('file_get_contents_mock')) {
        function file_get_contents_mock($filename) {
            if ($filename === 'php://input') {
                return $GLOBALS['HTTP_RAW_POST_DATA'];
            }
            return file_get_contents($filename);
        }
    }
    
    $authController = new AuthController();
    
    // This would normally be called from server.php
    echo "Attempting registration...\n";
    
} catch (Exception $e) {
    echo "❌ Registration test failed: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
$output = ob_get_clean();
echo $output;

echo "\n=== Environment Variables ===\n";
echo "DB_HOST: " . (getenv('DB_HOST') ?: 'NOT SET') . "\n";
echo "DB_NAME: " . (getenv('DB_NAME') ?: 'NOT SET') . "\n";
echo "DB_USER: " . (getenv('DB_USER') ?: 'NOT SET') . "\n";
echo "DB_PASSWORD: " . (getenv('DB_PASSWORD') ? 'SET' : 'NOT SET') . "\n";
echo "RECAPTCHA_SECRET_KEY: " . (getenv('RECAPTCHA_SECRET_KEY') ? 'SET' : 'NOT SET') . "\n";
?>
