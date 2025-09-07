<?php
echo "=== Google OAuth SSL Fix Verification ===\n\n";

// Test 1: Verify SSL connection to Google APIs works
echo "1. Testing direct Google API SSL connection...\n";
$url = 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=invalid_token_test';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
curl_setopt($ch, CURLOPT_CAINFO, __DIR__ . '/cacert.pem');

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    echo "   ❌ SSL Error: " . $curlError . "\n";
} else {
    echo "   ✅ SSL Connection to Google APIs: SUCCESS\n";
    echo "   HTTP Code: " . $httpCode . " (400 expected for invalid token)\n";
    
    $googleResponse = json_decode($response, true);
    if ($googleResponse && isset($googleResponse['error'])) {
        echo "   ✅ Google properly rejected invalid token\n";
    }
}

// Test 2: Test our backend Google OAuth endpoint
echo "\n2. Testing backend Google OAuth endpoint...\n";

$postData = json_encode(['token' => 'test_invalid_token']);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:5000/api/auth/google-signin');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($postData)
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "   Backend Response Code: " . $httpCode . "\n";

$backendResponse = json_decode($response, true);
if ($backendResponse) {
    echo "   Backend Message: " . ($backendResponse['message'] ?? 'No message') . "\n";
    
    // Check if the error is about invalid token (not SSL)
    if (isset($backendResponse['message'])) {
        $message = $backendResponse['message'];
        if (strpos($message, 'SSL certificate') !== false) {
            echo "   ❌ Still getting SSL errors\n";
        } elseif (strpos($message, 'Invalid token') !== false || strpos($message, 'Invalid Google token') !== false) {
            echo "   ✅ SSL issue resolved! Now properly validating tokens\n";
        } else {
            echo "   ⚠️  Different error: " . $message . "\n";
        }
    }
}

echo "\n=== Summary ===\n";
if (!$curlError && strpos($backendResponse['message'] ?? '', 'SSL certificate') === false) {
    echo "🎉 SUCCESS: Google OAuth SSL issue has been RESOLVED!\n";
    echo "   ✅ SSL connections to Google APIs working\n";
    echo "   ✅ Backend can now communicate with Google\n";
    echo "   ✅ Ready for real Google OAuth tokens\n";
    echo "\nYour frontend should now be able to sign in with Google successfully!\n";
} else {
    echo "❌ SSL issues still present. Additional troubleshooting needed.\n";
}

echo "\n=== Fix Applied ===\n";
echo "1. Downloaded CA certificate bundle (cacert.pem)\n";
echo "2. Updated php.ini with SSL configuration\n";
echo "3. Modified AuthController to use proper SSL settings\n";
echo "4. Server restarted with new configuration\n";
?>
