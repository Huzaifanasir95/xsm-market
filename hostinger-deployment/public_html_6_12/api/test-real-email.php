<?php
require_once 'config/database.php';
require_once 'utils/EmailService.php';

// Load environment variables
$dotenv = __DIR__ . '/.env';
if (file_exists($dotenv)) {
    $lines = file($dotenv, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
        putenv(trim($name) . '=' . trim($value));
    }
}

echo "🧪 Testing REAL Email Sending to malikhuzaifa7331@gmail.com\n";
echo str_repeat("=", 60) . "\n\n";

try {
    $emailService = new EmailService();
    
    echo "📧 Email Service Initialized\n";
    echo "🔑 Gmail User: " . (getenv('GMAIL_USER') ? getenv('GMAIL_USER') : 'NOT SET') . "\n";
    echo "🔐 App Password: " . (getenv('GMAIL_APP_PASSWORD') ? 'SET (****)' : 'NOT SET') . "\n\n";
    
    // Test data
    $email = 'malikhuzaifa7331@gmail.com';
    $otp = '789012';
    $username = 'Huzaifa';
    $verificationToken = 'test_token_' . time();
    
    echo "📩 Sending password change OTP email...\n";
    echo "📧 To: $email\n";
    echo "🔢 OTP: $otp\n";
    echo "👤 Username: $username\n\n";
    
    $startTime = microtime(true);
    $result = $emailService->sendPasswordChangeVerification($email, $otp, $username, $verificationToken);
    $endTime = microtime(true);
    $duration = round(($endTime - $startTime) * 1000);
    
    echo "\n⏱️  Email sending took: {$duration}ms\n";
    
    if ($result) {
        echo "✅ SUCCESS: Real email sent to $email!\n";
        echo "🎯 Check your Gmail inbox for the OTP email\n";
        echo "🔢 OTP to look for: $otp\n\n";
        
        // Check if mock email was created (would indicate fallback)
        $mockLogFile = __DIR__ . '/logs/mock-emails.log';
        if (file_exists($mockLogFile)) {
            $lastMockLines = shell_exec("tail -n 20 " . escapeshellarg($mockLogFile));
            $currentTime = date('Y-m-d H:i');
            if (strpos($lastMockLines, $currentTime) !== false) {
                echo "⚠️  WARNING: Mock email log was updated, might be fallback!\n";
                echo "📋 Recent mock log content:\n";
                echo $lastMockLines . "\n";
            } else {
                echo "✨ No recent mock email log - this was a REAL email!\n";
            }
        } else {
            echo "✨ No mock email log found - this was definitely a REAL email!\n";
        }
        
    } else {
        echo "❌ FAILED: Could not send email\n";
    }
    
} catch (Exception $e) {
    echo "💥 ERROR: " . $e->getMessage() . "\n";
}

echo "\n" . str_repeat("=", 60) . "\n";
echo "🏁 Test completed\n";
?>
