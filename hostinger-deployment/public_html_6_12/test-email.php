<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>🧪 XSM Market - Production Email Test</h2>\n";
echo "<p>Testing email functionality on production server...</p>\n";

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

// Include EmailService
require_once 'utils/EmailService.php';

echo "<h3>📧 Email Configuration Check</h3>\n";
echo "<ul>\n";
echo "<li><strong>PHP_ENV:</strong> " . (getenv('PHP_ENV') ?: 'not set') . "</li>\n";
echo "<li><strong>GMAIL_USER:</strong> " . (getenv('GMAIL_USER') ? '✅ Set' : '❌ Not set') . "</li>\n";
echo "<li><strong>GMAIL_APP_PASSWORD:</strong> " . (getenv('GMAIL_APP_PASSWORD') ? '✅ Set' : '❌ Not set') . "</li>\n";
echo "<li><strong>PHPMailer Available:</strong> " . (class_exists('PHPMailer\PHPMailer\PHPMailer') || class_exists('PHPMailer') ? '✅ Yes' : '❌ No') . "</li>\n";
echo "<li><strong>Native mail() function:</strong> " . (function_exists('mail') ? '✅ Available' : '❌ Not available') . "</li>\n";
echo "</ul>\n";

// Test email sending
if (isset($_GET['test']) && $_GET['test'] === 'send') {
    $testEmail = $_GET['email'] ?? 'test@example.com';
    $testOTP = '123456';
    
    echo "<h3>🚀 Sending Test Email</h3>\n";
    echo "<p>Sending OTP email to: <strong>$testEmail</strong></p>\n";
    
    try {
        $emailService = new EmailService();
        $result = $emailService->sendOTPEmail($testEmail, $testOTP, 'Test User');
        
        if ($result) {
            echo "<p style='color: green;'>✅ <strong>Email sent successfully!</strong></p>\n";
        } else {
            echo "<p style='color: red;'>❌ <strong>Email failed to send</strong></p>\n";
        }
        
    } catch (Exception $e) {
        echo "<p style='color: red;'>❌ <strong>Exception:</strong> " . $e->getMessage() . "</p>\n";
    }
    
    echo "<p><strong>Check the server error logs for detailed information.</strong></p>\n";
} else {
    echo "<h3>🧪 Test Email Sending</h3>\n";
    echo "<form method='GET'>\n";
    echo "<input type='hidden' name='test' value='send'>\n";
    echo "<label>Test Email Address: </label>\n";
    echo "<input type='email' name='email' value='test@gmail.com' required>\n";
    echo "<button type='submit'>Send Test OTP Email</button>\n";
    echo "</form>\n";
}

echo "<hr>\n";
echo "<h3>📝 Mock Email Log</h3>\n";
$logFile = 'logs/mock-emails.log';
if (file_exists($logFile)) {
    echo "<pre style='background: #f5f5f5; padding: 10px; max-height: 300px; overflow-y: scroll;'>\n";
    echo htmlspecialchars(tail($logFile, 50)); // Show last 50 lines
    echo "</pre>\n";
} else {
    echo "<p>No mock email log found.</p>\n";
}

// Tail function to get last N lines of a file
function tail($filename, $lines = 10) {
    $handle = fopen($filename, "r");
    if (!$handle) return '';
    
    $linecounter = $lines;
    $pos = -2;
    $beginning = false;
    $text = array();
    
    while ($linecounter > 0) {
        $t = " ";
        while ($t != "\n") {
            if (fseek($handle, $pos, SEEK_END) == -1) {
                $beginning = true;
                break;
            }
            $t = fgetc($handle);
            $pos--;
        }
        $linecounter--;
        if ($beginning) {
            rewind($handle);
        }
        $text[$lines - $linecounter - 1] = fgets($handle);
        if ($beginning) break;
    }
    fclose($handle);
    return array_reverse($text);
}
?>

<style>
body { font-family: Arial, sans-serif; margin: 20px; }
h2 { color: #333; }
h3 { color: #666; border-bottom: 1px solid #eee; padding-bottom: 5px; }
ul { background: #f9f9f9; padding: 15px; border-radius: 5px; }
form { background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 10px 0; }
input[type="email"] { padding: 8px; margin: 5px; width: 200px; }
button { padding: 8px 15px; background: #007cba; color: white; border: none; border-radius: 3px; cursor: pointer; }
button:hover { background: #005a87; }
</style>