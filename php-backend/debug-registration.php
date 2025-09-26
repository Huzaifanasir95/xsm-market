<?php
// Debug script to test registration endpoint directly
// Place this in your php-backend folder and access via browser

header('Content-Type: text/plain');

echo "=== REGISTRATION DEBUG TEST ===\n\n";

// Test 1: Check if all required files exist
echo "1. Checking required files:\n";
$requiredFiles = [
    'config/database.php',
    'controllers/AuthController.php',
    'utils/EmailService.php',
    'utils/Response.php',
    '.env'
];

foreach ($requiredFiles as $file) {
    $exists = file_exists(__DIR__ . '/' . $file);
    echo "   $file: " . ($exists ? "EXISTS" : "MISSING") . "\n";
}

echo "\n2. Checking environment variables:\n";
$envVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'PHP_ENV', 'SMTP_HOST'];
foreach ($envVars as $var) {
    $value = getenv($var) ?: $_ENV[$var] ?? 'NOT_SET';
    echo "   $var: $value\n";
}

echo "\n3. Testing database connection:\n";
try {
    require_once __DIR__ . '/config/database.php';
    echo "   Database connection: SUCCESS\n";
    
    // Test query
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "   Users table query: SUCCESS (found {$result['count']} users)\n";
    
} catch (Exception $e) {
    echo "   Database connection: FAILED - " . $e->getMessage() . "\n";
}

echo "\n4. Testing email service initialization:\n";
try {
    require_once __DIR__ . '/utils/EmailService.php';
    $emailService = new EmailService();
    echo "   EmailService creation: SUCCESS\n";
} catch (Exception $e) {
    echo "   EmailService creation: FAILED - " . $e->getMessage() . "\n";
}

echo "\n5. Checking PHP configuration:\n";
echo "   PHP Version: " . phpversion() . "\n";
echo "   Memory Limit: " . ini_get('memory_limit') . "\n";
echo "   Max Execution Time: " . ini_get('max_execution_time') . "\n";
echo "   Error Reporting: " . (error_reporting() ? "ON" : "OFF") . "\n";
echo "   Display Errors: " . (ini_get('display_errors') ? "ON" : "OFF") . "\n";

echo "\n6. Testing registration endpoint manually:\n";
echo "   You can now test with these curl commands:\n\n";

echo "   Test command (replace with real values):\n";
echo "   curl -X POST 'https://your-domain.com/api/auth/register' \\\n";
echo "        -H 'Content-Type: application/json' \\\n";
echo "        -d '{\"username\":\"testuser\",\"email\":\"test@test.com\",\"password\":\"testpass123\"}'\n\n";

echo "=== END DEBUG TEST ===\n";
?>