<?php
require_once 'config/database.php';
require_once 'utils/NOWPaymentsAPI.php';

echo "Testing NOWPayments Integration...\n\n";

try {
    // Test database connection
    $pdo = Database::getConnection();
    echo "✅ Database connection: OK\n";
    
    // Test environment variables
    echo "📋 Environment variables:\n";
    echo "  - NOW_PAYMENTS_ENVIRONMENT: " . (getenv('NOW_PAYMENTS_ENVIRONMENT') ?: 'sandbox') . "\n";
    echo "  - NOW_PAYMENTS_API_KEY_SANDBOX: " . (getenv('NOW_PAYMENTS_API_KEY_SANDBOX') ? 'Set' : 'Not set') . "\n";
    echo "  - NOW_PAYMENTS_IPN_SECRET_SANDBOX: " . (getenv('NOW_PAYMENTS_IPN_SECRET_SANDBOX') ? 'Set' : 'Not set') . "\n";
    echo "  - NOW_PAYMENTS_WEBHOOK_URL: " . (getenv('NOW_PAYMENTS_WEBHOOK_URL') ?: 'Not set') . "\n\n";
    
    // Test NOWPayments API
    $nowPayments = new NOWPaymentsAPI();
    echo "✅ NOWPayments API initialized\n";
    
    // Test getting supported currencies
    $currencies = $nowPayments->getSupportedCurrencies();
    echo "✅ Supported currencies loaded: " . count($currencies) . " currencies\n";
    
    // Test crypto_payments table
    $stmt = $pdo->query("SHOW TABLES LIKE 'crypto_payments'");
    if ($stmt->rowCount() > 0) {
        echo "✅ crypto_payments table exists\n";
        
        // Check table structure
        $stmt = $pdo->query("DESCRIBE crypto_payments");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo "📋 Table columns: " . implode(', ', $columns) . "\n";
    } else {
        echo "❌ crypto_payments table does not exist\n";
    }
    
    echo "\n🎉 NOWPayments integration test completed successfully!\n";
    echo "\n📝 Next steps:\n";
    echo "  1. Start the PHP server: php -S localhost:8000\n";
    echo "  2. Test API endpoint: http://localhost:8000/api/test-nowpayments\n";
    echo "  3. Test webhook: " . (getenv('NOW_PAYMENTS_WEBHOOK_URL') ?: 'Configure webhook URL') . "\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
?>
