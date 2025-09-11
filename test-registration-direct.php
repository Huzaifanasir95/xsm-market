<?php
// Direct test of the registration functionality
require_once 'php-backend/config/database.php';
require_once 'php-backend/controllers/AuthController.php';

// Test the EmailService first
echo "=== Testing Email Service ===\n";
try {
    require_once 'php-backend/utils/EmailService.php';
    $emailService = new EmailService();
    echo "✅ EmailService instantiated successfully\n";
} catch (Exception $e) {
    echo "❌ EmailService failed: " . $e->getMessage() . "\n";
}

// Test database connection and check for existing test users
echo "\n=== Checking for existing test users ===\n";
try {
    $db = new Database();
    $connection = $db->getConnection();
    
    $stmt = $connection->prepare("SELECT * FROM users WHERE email LIKE 'test%@example.com'");
    $stmt->execute();
    $testUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Found " . count($testUsers) . " test users\n";
    foreach ($testUsers as $user) {
        echo "  - {$user['email']} (verified: " . ($user['isEmailVerified'] ? 'yes' : 'no') . ")\n";
    }
    
} catch (Exception $e) {
    echo "❌ Database query failed: " . $e->getMessage() . "\n";
}

// Test the RecaptchaService
echo "\n=== Testing RecaptchaService ===\n";
try {
    require_once 'php-backend/utils/RecaptchaService.php';
    $recaptcha = new RecaptchaService();
    echo "✅ RecaptchaService instantiated successfully\n";
    echo "Should enforce reCAPTCHA: " . ($recaptcha->shouldEnforce() ? 'YES' : 'NO') . "\n";
} catch (Exception $e) {
    echo "❌ RecaptchaService failed: " . $e->getMessage() . "\n";
}

// Test manual user creation (bypassing the controller to isolate issues)
echo "\n=== Testing Manual User Creation ===\n";
try {
    $db = new Database();
    $connection = $db->getConnection();
    
    $testEmail = 'manual_test@example.com';
    $testUsername = 'manualtest';
    $testPassword = password_hash('password123', PASSWORD_DEFAULT);
    $otp = '123456';
    $otpExpires = date('Y-m-d H:i:s', time() + 600);
    
    // Check if user exists
    $stmt = $connection->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$testEmail]);
    if ($stmt->fetch()) {
        echo "Test user already exists, deleting...\n";
        $stmt = $connection->prepare("DELETE FROM users WHERE email = ?");
        $stmt->execute([$testEmail]);
    }
    
    // Insert test user
    $stmt = $connection->prepare("
        INSERT INTO users (username, email, password, emailOTP, otpExpires, isEmailVerified, authProvider, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, 0, 'email', NOW(), NOW())
    ");
    $result = $stmt->execute([$testUsername, $testEmail, $testPassword, $otp, $otpExpires]);
    
    if ($result) {
        echo "✅ Manual user creation successful\n";
        $userId = $connection->lastInsertId();
        echo "User ID: $userId\n";
    } else {
        echo "❌ Manual user creation failed\n";
    }
    
} catch (Exception $e) {
    echo "❌ Manual user creation failed: " . $e->getMessage() . "\n";
}
?>
