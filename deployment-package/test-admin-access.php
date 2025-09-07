<?php
// Test admin access functionality
require_once __DIR__ . '/config/env.php';
require_once __DIR__ . '/middleware/auth.php';

// Load .env file
loadEnv();

echo "=== Admin Access Test ===\n\n";

// Get admin email from environment
$adminEmail = getenv('admin_user');
echo "Admin email from .env: " . ($adminEmail ?: '[NOT SET]') . "\n\n";

// Test 1: Test the admin check function
echo "1. Testing admin email comparison...\n";

$testEmails = [
    'Tiktokwaalii2@gmail.com',
    'tiktokwaalii2@gmail.com', // lowercase
    'TIKTOKWAALII2@GMAIL.COM', // uppercase
    'nasirhuzaifa95@gmail.com', // existing user
    'test@example.com' // non-admin
];

foreach ($testEmails as $email) {
    $isAdmin = $adminEmail && strtolower($email) === strtolower($adminEmail);
    echo "   " . $email . " -> " . ($isAdmin ? "✅ ADMIN" : "❌ Not admin") . "\n";
}

echo "\n2. Current database users:\n";
try {
    $pdo = Database::getConnection();
    $stmt = $pdo->query("SELECT id, username, email, authProvider, isAdmin FROM users ORDER BY id");
    $users = $stmt->fetchAll();
    
    foreach ($users as $user) {
        $isAdminByEmail = $adminEmail && strtolower($user['email']) === strtolower($adminEmail);
        $isAdminByFlag = !empty($user['isAdmin']);
        $adminStatus = '';
        
        if ($isAdminByEmail) $adminStatus .= ' [ADMIN BY EMAIL]';
        if ($isAdminByFlag) $adminStatus .= ' [ADMIN BY FLAG]';
        if (!$adminStatus) $adminStatus = ' [NOT ADMIN]';
        
        echo "   ID: " . $user['id'] . " | " . $user['email'] . " | " . $user['authProvider'] . $adminStatus . "\n";
    }
    
} catch (Exception $e) {
    echo "   ❌ Error: " . $e->getMessage() . "\n";
}

echo "\n=== Test Complete ===\n";
echo "When the admin user (" . $adminEmail . ") registers and logs in,\n";
echo "they will see the Admin Dashboard button in the navigation.\n";
?>
