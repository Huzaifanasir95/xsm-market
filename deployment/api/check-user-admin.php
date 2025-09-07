<?php
/**
 * Script to check if a user is admin
 * Usage: php check-user-admin.php <email>
 */

require_once __DIR__ . '/config/database.php';

if ($argc < 2) {
    echo "Usage: php check-user-admin.php <email>\n";
    echo "Example: php check-user-admin.php admin@example.com\n";
    exit(1);
}

$email = $argv[1];

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id, username, email, isAdmin, authProvider FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo "❌ User with email '$email' not found.\n";
        exit(1);
    }
    
    echo "👤 User Details:\n";
    echo "   ID: {$user['id']}\n";
    echo "   Username: {$user['username']}\n";
    echo "   Email: {$user['email']}\n";
    echo "   Auth Provider: {$user['authProvider']}\n";
    echo "   Is Admin: " . ($user['isAdmin'] ? "✅ YES" : "❌ NO") . "\n";
    
    // Also check against env admin email
    $adminEmail = getenv('admin_user');
    $isAdminByEmail = $adminEmail && strtolower($user['email']) === strtolower($adminEmail);
    
    echo "   Admin by .env: " . ($isAdminByEmail ? "✅ YES" : "❌ NO") . " (admin_user = " . ($adminEmail ?: '[NOT SET]') . ")\n";
    
    $finalAdminStatus = $user['isAdmin'] || $isAdminByEmail;
    echo "\n🔑 Final Admin Status: " . ($finalAdminStatus ? "✅ ADMIN ACCESS GRANTED" : "❌ NO ADMIN ACCESS") . "\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
