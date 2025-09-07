<?php
// Test the deals API endpoint
$api_url = 'http://localhost:5000/api/deals.php?action=create';

$test_data = [
    'seller_id' => '1',
    'channel_id' => 'test-channel',
    'channel_title' => 'Test Channel',
    'channel_price' => 100,
    'escrow_fee' => 4.8,
    'transaction_type' => 'safest',
    'buyer_email' => 'test@example.com',
    'transaction_id' => 'XSM' . time() . '123',
    'payment_methods' => [
        [
            'id' => 'paypal',
            'name' => 'PayPal',
            'category' => 'digital'
        ]
    ]
];

// Test without authentication first to see if endpoint is reachable
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($test_data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_VERBOSE, true);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);

curl_close($ch);

echo "HTTP Code: $http_code\n";
echo "Response: $response\n";
if ($curl_error) {
    echo "cURL Error: $curl_error\n";
}
?>
