<?php
echo "=== Google OAuth Test ===\n\n";

// Test Google OAuth endpoint without actual token
echo "1. Testing Google OAuth endpoint availability...\n";

$postData = json_encode(['token' => 'test_token_for_endpoint_test']);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://xsmmarket.com/api/auth/google-signin');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($postData)
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    echo "   ❌ cURL error: " . $curlError . "\n";
} else {
    echo "   ✅ Google OAuth endpoint responded\n";
    echo "   HTTP Code: " . $httpCode . "\n";
    echo "   Response preview: " . substr($response, 0, 200) . "...\n";
    
    $responseData = json_decode($response, true);
    if ($responseData && isset($responseData['error'])) {
        echo "   Expected error response: " . $responseData['message'] . "\n";
    }
}

echo "\n=== Test Complete ===\n";
?>
