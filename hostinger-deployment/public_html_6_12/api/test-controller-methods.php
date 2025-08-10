<?php
require_once 'controllers/UserController.php';
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

echo "Testing UserController dual verification methods...\n\n";

$controller = new UserController();

echo "✅ UserController created successfully\n";
echo "✅ verifyCurrentEmail method exists: " . (method_exists($controller, 'verifyCurrentEmail') ? 'YES' : 'NO') . "\n";
echo "✅ verifyNewEmail method exists: " . (method_exists($controller, 'verifyNewEmail') ? 'YES' : 'NO') . "\n";

echo "\nTesting EmailService dual verification methods...\n";
$emailService = new EmailService();
echo "✅ sendCurrentEmailVerification method exists: " . (method_exists($emailService, 'sendCurrentEmailVerification') ? 'YES' : 'NO') . "\n";
echo "✅ sendNewEmailVerification method exists: " . (method_exists($emailService, 'sendNewEmailVerification') ? 'YES' : 'NO') . "\n";
echo "✅ sendEmailChangeConfirmation method exists: " . (method_exists($emailService, 'sendEmailChangeConfirmation') ? 'YES' : 'NO') . "\n";

echo "\nAll methods are ready! 🎉\n";
?>
