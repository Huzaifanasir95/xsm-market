<?php
/**
 * Script to set a user as admin in the database
 * Usage: php set-user-admin.php <email>
 */

require_once __DIR__ . '/config/database.php';

if ($argc < 2) {
    echo "Usage: php set-user-admin.php <email>\n";
    echo "Example: php set-user-admin.php admin@example.com\n";
    exit(1);
}

$email = $argv[1];

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id, username, email, isAdmin FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo "❌ User with email '$email' not found.\n";
        exit(1);
    }
    
    if ($user['isAdmin']) {
        echo "✅ User '{$user['username']}' ({$user['email']}) is already an admin.\n";
        exit(0);
    }
    
    // Set user as admin
    $stmt = $pdo->prepare("UPDATE users SET isAdmin = 1, updatedAt = NOW() WHERE email = ?");
    $stmt->execute([$email]);
    
    echo "✅ Successfully set user '{$user['username']}' ({$user['email']}) as admin!\n";
    echo "🔑 User can now access admin dashboard and admin features.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
