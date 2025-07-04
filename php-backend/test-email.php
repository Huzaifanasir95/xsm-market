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

echo "Testing email configuration...\n";
echo "GMAIL_USER: " . getenv('GMAIL_USER') . "\n";
echo "GMAIL_APP_PASSWORD: " . (getenv('GMAIL_APP_PASSWORD') ? 'SET' : 'NOT SET') . "\n";

$emailService = new EmailService();
$result = $emailService->sendOTPEmail('Tiktokwaalii2@gmail.com', '123456', 'testuser');

echo "Email test result: " . ($result ? 'SUCCESS' : 'FAILED') . "\n";
?>
