<?php
echo "🧪 Testing webhook endpoint...\n";

$webhook_url = 'http://localhost:5000/webhooks/nowpayments';

// Create a test webhook payload
$test_payload = [
    'payment_id' => 'test_payment_123',
    'payment_status' => 'finished',
    'pay_amount' => 100.50,
    'price_amount' => 10.00,
    'price_currency' => 'USD',
    'pay_currency' => 'btc',
    'order_id' => 'deal_1_' . time(), // Correct format: deal_{dealId}_{timestamp}
    'actually_paid' => 100.50, // Added missing field
    'outcome_amount' => 100.50,
    'outcome_currency' => 'btc'
];

$json_payload = json_encode($test_payload);

// Create HMAC signature
$ipn_secret = 'ZJKbVZ1hQXkUmkN4XZX/FsCkXVWYgQJJ'; // Sandbox IPN secret from .env
$signature = hash_hmac('sha512', $json_payload, $ipn_secret);

echo "📦 Test payload: " . $json_payload . "\n";
echo "🔐 Generated signature: " . $signature . "\n";

// Send POST request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $webhook_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $json_payload);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-nowpayments-sig: ' . $signature,
    'User-Agent: NOWPayments'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "📡 HTTP Response Code: $httpCode\n";
echo "📝 Response Body: $response\n";

if ($httpCode === 200) {
    echo "✅ Webhook endpoint is working!\n";
} else {
    echo "❌ Webhook endpoint failed with HTTP $httpCode\n";
}
?>
