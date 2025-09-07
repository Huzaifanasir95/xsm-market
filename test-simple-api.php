<?php
// Quick test to check what the API is returning
$token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjUsImVtYWlsIjoibmFzaXJodXphaWZhOTVAZ21haWwuY29tIiwidXNlcm5hbWUiOiJodXphaWZhbmFzaXIxMTEiLCJpYXQiOjE3Mjg1NjcxMTcsImV4cCI6MTcyODY1MzUxNywidHlwZSI6ImFjY2VzcyJ9.example";

// Try to make a simple curl request to test the endpoint
$url = 'http://localhost:5000/ads/my-ads';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";
echo "Response length: " . strlen($response) . "\n";
echo "First 200 chars: " . substr($response, 0, 200) . "\n";
?>
