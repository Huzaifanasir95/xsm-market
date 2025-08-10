<?php
// Test the /ads/my-ads endpoint directly

$API_URL = 'http://localhost:5000';

// First, we need to get a valid token for user huzaifanasir111
// Let's check what token this user would have
echo "🔍 Testing /ads/my-ads endpoint...\n";

// You'll need to get the actual token for the user
// For now, let's test if the endpoint responds
$testUrl = $API_URL . '/ads/my-ads';

echo "📡 Testing URL: $testUrl\n";

// Test without authentication first to see the error
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $testUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "📊 Response without auth:\n";
echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";

// Now we need to get a token. Let's check if we can create a test token
// Or manually create one for testing
echo "\n🔑 We need to test with proper authentication...\n";
echo "User huzaifanasir111 should have ID 5 in the database\n";

?>
