<?php
// Set admin privileges for the specified admin user
require_once __DIR__ . '/config/env.php';
require_once __DIR__ . '/config/database.php';

// Load .env file
loadEnv();

echo "=== Setting Admin Privileges ===\n\n";

try {
    $pdo = Database::getConnection();
    
    // Get admin email from environment
    $adminEmail = getenv('admin_user');
    
    if (!$adminEmail) {
        echo "❌ admin_user not found in .env file\n";
        exit(1);
    }
    
    echo "Admin email from .env: " . $adminEmail . "\n";
    
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id, email, username, isAdmin FROM users WHERE email = ?");
    $stmt->execute([$adminEmail]);
    $user = $stmt->fetch();
    
    if (!$user) {
        echo "❌ Admin user not found in database: " . $adminEmail . "\n";
        echo "   Please register this user first through the frontend.\n";
        exit(1);
    }
    
    echo "Found user: " . $user['username'] . " (ID: " . $user['id'] . ")\n";
    echo "Current admin status: " . ($user['isAdmin'] ? 'Yes' : 'No') . "\n";
    
    if ($user['isAdmin']) {
        echo "✅ User already has admin privileges\n";
    } else {
        // Set admin privileges
        $stmt = $pdo->prepare("UPDATE users SET isAdmin = 1 WHERE email = ?");
        $success = $stmt->execute([$adminEmail]);
        
        if ($success) {
            echo "✅ Admin privileges granted successfully\n";
        } else {
            echo "❌ Failed to grant admin privileges\n";
            exit(1);
        }
    }
    
    // Verify the change
    $stmt = $pdo->prepare("SELECT isAdmin FROM users WHERE email = ?");
    $stmt->execute([$adminEmail]);
    $updatedUser = $stmt->fetch();
    
    if ($updatedUser['isAdmin']) {
        echo "✅ Verification successful: Admin privileges are active\n";
    } else {
        echo "❌ Verification failed: Admin privileges not set\n";
        exit(1);
    }
    
    echo "\n=== Admin Setup Complete ===\n";
    echo "The user " . $adminEmail . " now has admin access.\n";
    echo "They will see the Admin Dashboard button when logged in.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
