<?php
// Debug script to check deployment status
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo "Debug Information:\n";
echo "=================\n\n";

// 1. Check if basic PHP is working
echo "✓ PHP is working\n";
echo "PHP Version: " . phpversion() . "\n\n";

// 2. Check if environment loading works
echo "Environment Variables:\n";
require_once __DIR__ . '/config/env.php';

$envVars = [
    'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD',
    'JWT_SECRET', 'ADMIN_EMAIL', 'FRONTEND_URL'
];

foreach ($envVars as $var) {
    $value = getenv($var);
    echo "$var: " . ($value ? 'SET' : 'NOT SET') . "\n";
}
echo "\n";

// 3. Check database connection
echo "Database Connection:\n";
try {
    require_once __DIR__ . '/config/database.php';
    $pdo = Database::getConnection();
    echo "✓ Database connection successful\n";
    
    // Test a simple query
    $stmt = $pdo->query("SELECT 1 as test");
    $result = $stmt->fetch();
    echo "✓ Database query test successful\n";
} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}
echo "\n";

// 4. Check file permissions
echo "File Permissions:\n";
$files = [
    __DIR__ . '/config/env.php',
    __DIR__ . '/config/database.php',
    __DIR__ . '/index.php',
    __DIR__ . '/.env'
];

foreach ($files as $file) {
    if (file_exists($file)) {
        echo basename($file) . ": ✓ EXISTS (perms: " . substr(sprintf('%o', fileperms($file)), -4) . ")\n";
    } else {
        echo basename($file) . ": ❌ NOT FOUND\n";
    }
}
echo "\n";

// 5. Check uploads directory
echo "Uploads Directory:\n";
$uploadDir = __DIR__ . '/uploads';
if (is_dir($uploadDir)) {
    echo "✓ Uploads directory exists\n";
    echo "Writable: " . (is_writable($uploadDir) ? "✓ YES" : "❌ NO") . "\n";
} else {
    echo "❌ Uploads directory not found\n";
}
echo "\n";

// 6. Memory and execution limits
echo "PHP Configuration:\n";
echo "Memory Limit: " . ini_get('memory_limit') . "\n";
echo "Max Execution Time: " . ini_get('max_execution_time') . "\n";
echo "Upload Max Filesize: " . ini_get('upload_max_filesize') . "\n";
echo "Post Max Size: " . ini_get('post_max_size') . "\n";
echo "\n";

echo "=================\n";
echo "Debug completed at: " . date('Y-m-d H:i:s') . "\n";
?>
