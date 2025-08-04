<?php
// Test script to simulate NOWPayments webhook
require_once 'php-backend/config/env.php'; // Load environment variables first
require_once 'php-backend/utils/NOWPaymentsAPI.php';

echo "🔧 Environment check:\n";
echo "NOW_PAYMENTS_ENVIRONMENT: " . ($_ENV['NOW_PAYMENTS_ENVIRONMENT'] ?? 'NOT SET') . "\n";
echo "API Key exists: " . (isset($_ENV['NOW_PAYMENTS_API_KEY_SANDBOX']) ? 'YES' : 'NO') . "\n";
echo "IPN Secret exists: " . (isset($_ENV['NOW_PAYMENTS_IPN_SECRET_SANDBOX']) ? 'YES' : 'NO') . "\n\n";

// Test webhook data (simulating a successful payment)
$testWebhookData = [
    'payment_id' => 'test_payment_' . time(),
    'payment_status' => 'finished', // This should trigger the deal update
    'pay_address' => 'test_address',
    'price_amount' => 14397.07,
    'price_currency' => 'usd',
    'pay_amount' => 0.5,
    'actually_paid' => 0.5,
    'pay_currency' => 'btc',
    'order_id' => 'deal_3_' . time(), // Assuming deal ID 3 from your screenshot
    'order_description' => 'Transaction fee payment',
    'purchase_id' => 'test_purchase',
    'outcome_amount' => 14397.07,
    'outcome_currency' => 'usd',
    'created_at' => date('c'),
    'updated_at' => date('c')
];

// Create the signature
$nowPayments = new NOWPaymentsAPI();
$webhookBody = json_encode($testWebhookData);
$ipnSecret = $nowPayments->getIPNSecret();
$signature = hash_hmac('sha512', $webhookBody, $ipnSecret);

echo "🚀 Testing NOWPayments Webhook\n";
echo "=====================================\n";
echo "Webhook URL: https://ab45f1494014.ngrok-free.app/webhooks/nowpayments\n";
echo "IPN Secret: " . substr($ipnSecret, 0, 10) . "...\n";
echo "Test Data: " . $webhookBody . "\n";
echo "Signature: " . $signature . "\n\n";

// Send the webhook request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://ab45f1494014.ngrok-free.app/webhooks/nowpayments');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $webhookBody);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-NOWPayments-Sig: ' . $signature
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "📊 Webhook Test Results:\n";
echo "HTTP Code: " . $httpCode . "\n";
echo "Response: " . $response . "\n";
if ($error) {
    echo "Error: " . $error . "\n";
}

echo "\n✅ Test completed!\n";
echo "Check the webhook logs at: php-backend/logs/webhook.log\n";
echo "Check PHP error logs for detailed debugging info.\n";
