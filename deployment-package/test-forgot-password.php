<?php
// Test script for forgot password functionality
require_once __DIR__ . '/controllers/AuthController.php';

// Simulate the forgot password request
$_SERVER['REQUEST_METHOD'] = 'POST';

// Create test input
$testEmail = 'test@example.com'; // Replace with actual test email
$testInput = json_encode(['email' => $testEmail]);

// Mock the php://input
file_put_contents('php://temp', $testInput);

try {
    $controller = new AuthController();
    
    echo "Testing forgot password functionality...\n";
    echo "Email: $testEmail\n\n";
    
    // Call the forgot password method
    $controller->forgotPassword();
    
    echo "\nTest completed successfully!\n";
    
} catch (Exception $e) {
    echo "Error during test: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
?>
