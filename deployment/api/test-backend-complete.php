<?php
echo "=== XSM Market PHP Backend Testing ===\n\n";

// Test 1: Database Connection
echo "1. Testing Database Connection...\n";
require_once __DIR__ . '/config/env.php';
loadEnv();

try {
    $host = getenv('DB_HOST') ?: 'localhost';
    $dbname = getenv('DB_NAME') ?: 'xsm_market_local';
    $username = getenv('DB_USER') ?: 'root';
    $password = getenv('DB_PASSWORD') ?: 'localpassword123';
    
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    
    echo "   ✅ Database connection successful!\n";
    
    // Check tables
    $tables = ['users', 'ads', 'chats', 'messages', 'chat_participants'];
    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
        $result = $stmt->fetch();
        echo "   ✅ Table '$table' accessible, records: " . $result['count'] . "\n";
    }
    
} catch (Exception $e) {
    echo "   ❌ Database connection failed: " . $e->getMessage() . "\n";
}

echo "\n2. Testing Environment Variables...\n";
$required_env = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET', 'GOOGLE_CLIENT_ID'];
foreach ($required_env as $env) {
    $value = getenv($env);
    if ($value) {
        echo "   ✅ $env: Set\n";
    } else {
        echo "   ❌ $env: Not set\n";
    }
}

echo "\n3. Testing PHP Extensions...\n";
$required_extensions = ['pdo', 'pdo_mysql', 'mysqli', 'json', 'mbstring'];
foreach ($required_extensions as $ext) {
    if (extension_loaded($ext)) {
        echo "   ✅ Extension '$ext': Loaded\n";
    } else {
        echo "   ❌ Extension '$ext': Not loaded\n";
    }
}

echo "\n4. API Endpoints Test (via localhost:5000)...\n";

// Test health endpoint
$health_url = 'http://localhost:5000/api/health';
$health_response = @file_get_contents($health_url);
if ($health_response) {
    echo "   ✅ Health endpoint: Working\n";
    echo "   Response: $health_response\n";
} else {
    echo "   ❌ Health endpoint: Not accessible\n";
}

// Test ads endpoint
$ads_url = 'http://localhost:5000/api/ads';
$ads_response = @file_get_contents($ads_url);
if ($ads_response) {
    $ads_data = json_decode($ads_response, true);
    if ($ads_data && isset($ads_data['ads'])) {
        echo "   ✅ Ads endpoint: Working (" . count($ads_data['ads']) . " ads found)\n";
    } else {
        echo "   ⚠️  Ads endpoint: Responding but unexpected format\n";
    }
} else {
    echo "   ❌ Ads endpoint: Not accessible\n";
}

echo "\n=== Test Complete ===\n";
echo "Backend Status: ";
if ($health_response && $ads_response) {
    echo "✅ FULLY FUNCTIONAL\n";
} else {
    echo "❌ NEEDS ATTENTION\n";
}
?>
