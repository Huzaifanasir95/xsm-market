<?php
// Temporary reCAPTCHA bypass for testing
// This file can be used to bypass reCAPTCHA verification during development/testing

class RecaptchaBypass {
    public static function verify($response, $remoteip = null) {
        // Always return true for testing
        return [
            'success' => true,
            'challenge_ts' => date('c'),
            'hostname' => $_SERVER['HTTP_HOST'] ?? 'unknown'
        ];
    }
    
    public static function isEnabled() {
        // Check if we should bypass reCAPTCHA
        $env = getenv('PHP_ENV');
        $bypassRecaptcha = getenv('BYPASS_RECAPTCHA');
        
        return !($env === 'development' || $bypassRecaptcha === 'true');
    }
}

// Function to verify reCAPTCHA with fallback
function verifyRecaptcha($recaptchaResponse, $secretKey = null) {
    // If bypass is enabled, return success
    if (!RecaptchaBypass::isEnabled()) {
        return RecaptchaBypass::verify($recaptchaResponse);
    }
    
    // Normal reCAPTCHA verification
    $secretKey = $secretKey ?: getenv('RECAPTCHA_SECRET_KEY');
    
    if (!$secretKey || !$recaptchaResponse) {
        return ['success' => false, 'error' => 'Missing reCAPTCHA data'];
    }
    
    $url = 'https://www.google.com/recaptcha/api/siteverify';
    $data = [
        'secret' => $secretKey,
        'response' => $recaptchaResponse,
        'remoteip' => $_SERVER['REMOTE_ADDR'] ?? ''
    ];
    
    $options = [
        'http' => [
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data)
        ]
    ];
    
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    
    if ($result === FALSE) {
        return ['success' => false, 'error' => 'Failed to verify reCAPTCHA'];
    }
    
    return json_decode($result, true);
}
?>
