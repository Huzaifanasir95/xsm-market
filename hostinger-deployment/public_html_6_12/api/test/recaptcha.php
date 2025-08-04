<?php
require_once __DIR__ . '/../utils/RecaptchaHelper.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }
    
    $recaptchaResponse = $input['g-recaptcha-response'] ?? '';
    $email = $input['email'] ?? '';
    
    if (empty($recaptchaResponse)) {
        echo json_encode([
            'success' => false, 
            'error' => 'reCAPTCHA response is required'
        ]);
        exit();
    }
    
    // Load environment variables
    if (file_exists(__DIR__ . '/../../.env')) {
        $envFile = file_get_contents(__DIR__ . '/../../.env');
        $lines = explode("\n", $envFile);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0) continue;
            list($key, $value) = explode('=', $line, 2);
            putenv("$key=$value");
        }
    }
    
    // Verify reCAPTCHA
    $result = verifyRecaptcha($recaptchaResponse);
    
    if ($result['success']) {
        echo json_encode([
            'success' => true,
            'message' => 'reCAPTCHA verification successful',
            'email' => $email,
            'domain' => $_SERVER['HTTP_HOST'] ?? 'unknown',
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'recaptcha_data' => $result
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'reCAPTCHA verification failed',
            'details' => $result,
            'domain' => $_SERVER['HTTP_HOST'] ?? 'unknown'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'domain' => $_SERVER['HTTP_HOST'] ?? 'unknown'
    ]);
}
?>
