<?php
require_once __DIR__ . '/utils/EmailService.php';

// Load environment from .env file
if (file_exists(__DIR__ . '/.env')) {
    $envFile = __DIR__ . '/.env';
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            putenv(trim($key) . '=' . trim($value));
        }
    }
}

echo "🧪 Testing Password Change OTP Email\n";
echo "====================================\n\n";

$emailService = new EmailService();

// Send password change verification email to the specified address
$testEmail = 'malikhuzaifa7331@gmail.com';
$testOTP = '567890';
$testUsername = 'Huzaifa';
$testToken = 'test-verification-token-123';
$isGoogleUser = false;

echo "📧 Sending password change OTP email to: $testEmail\n";
echo "🔢 OTP Code: $testOTP\n";
echo "👤 Username: $testUsername\n\n";

$result = $emailService->sendPasswordChangeVerification($testEmail, $testOTP, $testUsername, $testToken, $isGoogleUser);

if ($result) {
    echo "✅ Password change OTP email sent successfully!\n";
    echo "🔍 Check the following locations for the OTP:\n";
    echo "   📋 Console output above\n";
    echo "   📁 php-backend/logs/mock-emails.log\n";
    echo "   🖥️  Backend server terminal\n\n";
    echo "🔢 Your OTP for testing: $testOTP\n";
} else {
    echo "❌ Email sending failed!\n";
}

echo "\n💡 This email contains password change verification instructions and OTP.\n";
echo "💡 In production, this would be sent to the actual email address.\n";
?>
