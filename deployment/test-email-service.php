<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/EmailService.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing EmailService...\n";

try {
    $emailService = new EmailService();
    echo "EmailService created successfully\n";
    
    // Test basic email sending
    $result = $emailService->sendEmail(
        'test@example.com',
        'Test Email',
        '<h1>Test HTML Email</h1><p>This is a test email.</p>',
        'Test plain text email. This is a test email.'
    );
    
    echo "Email send result: " . ($result ? 'SUCCESS' : 'FAILED') . "\n";
    
    // Test email change verification specifically
    echo "\nTesting email change verification...\n";
    $result2 = $emailService->sendEmailChangeVerification(
        'test@example.com',
        '123456',
        'testuser',
        'test-token'
    );
    
    echo "Email change verification result: " . ($result2 ? 'SUCCESS' : 'FAILED') . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
?>
