<?php
require_once 'utils/EmailService.php';
require_once 'config/Database.php';

// Load environment variables
if (file_exists('.env')) {
    $lines = file('.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            putenv(trim($key) . '=' . trim($value));
        }
    }
}

echo "Testing Dual Email Verification System...\n\n";

$emailService = new EmailService();

// Test 1: Send verification to current email (Step 1)
echo "1. Testing sendCurrentEmailVerification...\n";
$result1 = $emailService->sendCurrentEmailVerification(
    'tiktokwaalii2@gmail.com', // current email (test email)
    '123456', // OTP
    'TestUser', // username
    'newemail@example.com' // new email
);

if ($result1) {
    echo "✅ Current email verification sent successfully!\n";
} else {
    echo "❌ Failed to send current email verification\n";
}

echo "\n2. Testing sendNewEmailVerification...\n";
$result2 = $emailService->sendNewEmailVerification(
    'tiktokwaalii2@gmail.com', // new email (using same test email)
    '654321', // OTP
    'TestUser' // username
);

if ($result2) {
    echo "✅ New email verification sent successfully!\n";
} else {
    echo "❌ Failed to send new email verification\n";
}

echo "\n3. Testing sendEmailChangeConfirmation...\n";
$result3 = $emailService->sendEmailChangeConfirmation(
    'tiktokwaalii2@gmail.com', // new email (using same test email)
    'TestUser' // username
);

if ($result3) {
    echo "✅ Email change confirmation sent successfully!\n";
} else {
    echo "❌ Failed to send email change confirmation\n";
}

echo "\nTest completed!\n";
?>
