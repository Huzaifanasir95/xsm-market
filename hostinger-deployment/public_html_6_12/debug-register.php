<?php
// Debug registration endpoint - helps troubleshoot signup issues
header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// Log all registration attempts
error_log("🔍 DEBUG REGISTRATION - Request received at " . date('Y-m-d H:i:s'));
error_log("🔍 DEBUG REGISTRATION - Request method: " . $_SERVER['REQUEST_METHOD']);
error_log("🔍 DEBUG REGISTRATION - Raw input: " . file_get_contents('php://input'));

try {
    // Load environment variables
    if (file_exists('.env')) {
        $lines = file('.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                list($key, $value) = explode('=', $line, 2);
                putenv(trim($key) . '=' . trim($value));
            }
        }
    }

    // Check environment
    $phpEnv = getenv('PHP_ENV') ?: 'production';
    error_log("🔍 DEBUG REGISTRATION - PHP_ENV: $phpEnv");
    error_log("🔍 DEBUG REGISTRATION - Gmail credentials: " . (getenv('GMAIL_USER') ? 'YES' : 'NO'));

    // Parse JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }

    error_log("🔍 DEBUG REGISTRATION - Parsed data: " . json_encode($input));

    // Validate required fields
    $required = ['username', 'email', 'password'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            throw new Exception("Field '$field' is required");
        }
    }

    // Database connection
    require_once 'config/database.php';
    $pdo = Database::connect();
    
    if (!$pdo) {
        throw new Exception('Database connection failed');
    }

    error_log("🔍 DEBUG REGISTRATION - Database connected successfully");

    // Check if user already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
    $stmt->execute([$input['email'], $input['username']]);
    
    if ($stmt->fetch()) {
        throw new Exception('User with this email or username already exists');
    }

    error_log("🔍 DEBUG REGISTRATION - User doesn't exist, proceeding with registration");

    // Generate OTP
    $otp = sprintf('%06d', mt_rand(0, 999999));
    error_log("🔍 DEBUG REGISTRATION - Generated OTP: $otp");

    // Hash password
    $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);

    // Insert user
    $stmt = $pdo->prepare("
        INSERT INTO users (username, email, password, otp, otpExpiry, emailVerified) 
        VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE), 0)
    ");
    
    $result = $stmt->execute([
        $input['username'],
        $input['email'],
        $hashedPassword,
        $otp
    ]);

    if (!$result) {
        throw new Exception('Failed to create user account');
    }

    error_log("🔍 DEBUG REGISTRATION - User created in database");

    // Send OTP email
    require_once 'utils/EmailService.php';
    $emailService = new EmailService();
    
    error_log("🔍 DEBUG REGISTRATION - Attempting to send OTP email");
    $emailResult = $emailService->sendOTPEmail($input['email'], $otp, $input['username']);
    
    if ($emailResult) {
        error_log("✅ DEBUG REGISTRATION - OTP email sent successfully");
    } else {
        error_log("❌ DEBUG REGISTRATION - OTP email failed to send");
    }

    // Always return success for debugging, but log the issue
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Registration successful. Please check your email for verification code.',
        'debug' => [
            'user_created' => true,
            'email_sent' => $emailResult,
            'otp_for_debug' => $phpEnv === 'development' ? $otp : 'hidden',
            'environment' => $phpEnv
        ]
    ]);

} catch (Exception $e) {
    error_log("❌ DEBUG REGISTRATION - Exception: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'debug' => [
            'file' => __FILE__,
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]
    ]);
}
?>