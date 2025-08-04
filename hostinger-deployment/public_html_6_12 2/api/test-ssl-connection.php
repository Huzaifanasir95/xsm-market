<?php
echo "=== SSL Connection Test ===\n\n";

// Test 1: Basic SSL connection to Google
echo "1. Testing SSL connection to Google APIs...\n";

$url = 'https://www.googleapis.com/oauth2/v3/tokeninfo';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
curl_setopt($ch, CURLOPT_CAINFO, __DIR__ . '/cacert.pem');
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'XSM-Market-Backend/1.0');

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
$sslInfo = curl_getinfo($ch, CURLINFO_SSL_VERIFYRESULT);
curl_close($ch);

if ($curlError) {
    echo "   ❌ SSL connection failed: " . $curlError . "\n";
    echo "   SSL verify result: " . $sslInfo . "\n";
} else {
    echo "   ✅ SSL connection successful!\n";
    echo "   HTTP Code: " . $httpCode . "\n";
    echo "   SSL verify result: " . $sslInfo . " (0 = success)\n";
}

// Test 2: Check CA bundle file
echo "\n2. Testing CA bundle file...\n";
$caBundlePath = __DIR__ . '/cacert.pem';
if (file_exists($caBundlePath)) {
    $fileSize = filesize($caBundlePath);
    echo "   ✅ CA bundle exists: " . $caBundlePath . "\n";
    echo "   File size: " . number_format($fileSize) . " bytes\n";
    
    // Check if file is readable and not empty
    if ($fileSize > 100000) {
        echo "   ✅ CA bundle appears to be valid\n";
    } else {
        echo "   ❌ CA bundle file seems too small\n";
    }
} else {
    echo "   ❌ CA bundle not found: " . $caBundlePath . "\n";
}

// Test 3: PHP SSL settings
echo "\n3. Testing PHP SSL configuration...\n";
$curlCaInfo = ini_get('curl.cainfo');
$opensslCaFile = ini_get('openssl.cafile');

echo "   curl.cainfo: " . ($curlCaInfo ?: '[not set]') . "\n";
echo "   openssl.cafile: " . ($opensslCaFile ?: '[not set]') . "\n";

if ($curlCaInfo && file_exists($curlCaInfo)) {
    echo "   ✅ curl.cainfo file exists\n";
} else {
    echo "   ⚠️  curl.cainfo not set or file doesn't exist\n";
}

echo "\n=== Test Complete ===\n";
?>
