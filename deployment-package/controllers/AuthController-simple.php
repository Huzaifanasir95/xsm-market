<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/EmailService.php';
require_once __DIR__ . '/../utils/jwt.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validation.php';

class AuthController {
    private $db;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }
    
    // Register new user (send OTP for verification)
    public function register() {
        $input = json_decode(file_get_contents('php://input'), true);
        $username = trim($input['username'] ?? '');
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        $fullName = trim($input['fullName'] ?? '');
        
        // Log registration attempt (filter out password)
        error_log('Registration attempt: ' . json_encode(['username' => $username, 'email' => $email, 'fullName' => $fullName]));
        
        // Validation
        if (!$username || !$email || !$password) {
            Response::error('Please provide username, email and password', 400);
        }
        
        if (strlen($password) < 6) {
            Response::error('Password must be at least 6 characters long', 400);
        }
        
        if ($fullName && strlen($fullName) > 100) {
            Response::error('Full name must be less than 100 characters', 400);
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('Please provide a valid email address', 400);
        }
        
        if (strlen($username) < 3 || strlen($username) > 50 || !preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
            Response::error('Username must be 3-50 characters long and contain only letters, numbers, and underscores', 400);
        }
        
        try {
            // Check if user already exists and is verified
            $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $existingUserByEmail = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $stmt = $this->db->prepare("SELECT * FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $existingUserByUsername = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($existingUserByEmail && $existingUserByEmail['isEmailVerified']) {
                Response::error('Email already registered and verified', 400);
            }
            
            if ($existingUserByUsername && $existingUserByUsername['isEmailVerified']) {
                Response::error('Username already taken', 400);
            }
            
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $otp = sprintf('%06d', mt_rand(100000, 999999));
            $otpExpires = date('Y-m-d H:i:s', time() + 600); // 10 minutes from now
            
            // If user exists but not verified, update their details
            if ($existingUserByEmail && !$existingUserByEmail['isEmailVerified']) {
                $stmt = $this->db->prepare("
                    UPDATE users SET 
                    username = ?, fullName = ?, password = ?, emailOTP = ?, otpExpires = ?
                    WHERE email = ?
                ");
                $stmt->execute([$username, $fullName, $hashedPassword, $otp, $otpExpires, $email]);
                $userId = $existingUserByEmail['id'];
            } else {
                // Create new user
                $stmt = $this->db->prepare("
                    INSERT INTO users (username, fullName, email, password, emailOTP, otpExpires, isEmailVerified, authProvider) 
                    VALUES (?, ?, ?, ?, ?, ?, 0, 'email')
                ");
                $stmt->execute([$username, $fullName, $email, $hashedPassword, $otp, $otpExpires]);
                $userId = $this->db->lastInsertId();
            }
            
            // Send OTP email
            $emailService = new EmailService();
            $emailResult = $emailService->sendOTPEmail($email, $otp, $username);
            
            if (!$emailResult) {
                Response::error('Failed to send verification email', 500);
            }
            
            error_log('Registration initiated for: ' . $email);
            
            Response::success([
                'message' => 'Registration initiated. Please check your email for verification OTP',
                'email' => $email,
                'requiresVerification' => true
            ]);
            
        } catch (Exception $e) {
            error_log('Registration error: ' . $e->getMessage());
            Response::error('Server error during registration: ' . $e->getMessage(), 500);
        }
    }
    
    // Login user
    public function login() {
        $input = json_decode(file_get_contents('php://input'), true);
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        
        error_log('Login attempt: ' . $email);
        
        // Validation
        if (!$email || !$password) {
            Response::error('Please provide email and password', 400);
        }
        
        try {
            // Find user
            $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                Response::error('Invalid credentials', 401);
            }
            
            // Check if email is verified (only for email auth users)
            if ($user['authProvider'] === 'email' && !$user['isEmailVerified']) {
                Response::error('Please verify your email before logging in', 401);
            }
            
            // Check password
            if (!password_verify($password, $user['password'])) {
                Response::error('Invalid credentials', 401);
            }
            
            // Generate tokens
            $jwtHelper = new JWTHelper();
            $accessToken = $jwtHelper->generateAccessToken($user['id']);
            $refreshToken = $jwtHelper->generateRefreshToken($user['id']);
            
            error_log('Login successful for user: ' . $user['id']);
            
            Response::success([
                'message' => 'Login successful',
                'accessToken' => $accessToken,
                'refreshToken' => $refreshToken,
                'user' => [
                    'id' => (int)$user['id'],
                    'username' => $user['username'],
                    'fullName' => $user['fullName'],
                    'email' => $user['email'],
                    'profilePicture' => $user['profilePicture'],
                    'isEmailVerified' => (bool)$user['isEmailVerified'],
                    'authProvider' => $user['authProvider']
                ]
            ]);
            
        } catch (Exception $e) {
            error_log('Login error: ' . $e->getMessage());
            Response::error('Server error during login: ' . $e->getMessage(), 500);
        }
    }
    
    // Verify OTP and complete registration
    public function verifyOTP() {
        $input = json_decode(file_get_contents('php://input'), true);
        $email = trim($input['email'] ?? '');
        $otp = trim($input['otp'] ?? '');
        
        error_log('OTP verification attempt: ' . $email);
        
        // Validation
        if (!$email || !$otp) {
            Response::error('Please provide email and OTP', 400);
        }
        
        try {
            // Find user
            $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                Response::error('User not found', 404);
            }
            
            // Check if already verified
            if ($user['isEmailVerified']) {
                Response::error('Email is already verified', 400);
            }
            
            // Verify OTP
            if (!$user['emailOTP'] || !$user['otpExpires']) {
                Response::error('No OTP found. Please request a new one.', 400);
            }
            
            $now = new DateTime();
            $expires = new DateTime($user['otpExpires']);
            
            if ($now > $expires) {
                Response::error('OTP has expired. Please request a new one.', 400);
            }
            
            if ($user['emailOTP'] !== $otp) {
                Response::error('Invalid OTP', 400);
            }
            
            // Verify user
            $stmt = $this->db->prepare("
                UPDATE users SET 
                isEmailVerified = 1, emailOTP = NULL, otpExpires = NULL 
                WHERE id = ?
            ");
            $stmt->execute([$user['id']]);
            
            // Generate tokens
            $jwtHelper = new JWTHelper();
            $accessToken = $jwtHelper->generateAccessToken($user['id']);
            $refreshToken = $jwtHelper->generateRefreshToken($user['id']);
            
            // Send welcome email
            $emailService = new EmailService();
            $emailService->sendWelcomeEmail($user['email'], $user['username']);
            
            error_log('User verification successful: ' . $user['id']);
            
            Response::success([
                'message' => 'Email verified successfully! Welcome to XSM Market!',
                'accessToken' => $accessToken,
                'refreshToken' => $refreshToken,
                'user' => [
                    'id' => (int)$user['id'],
                    'username' => $user['username'],
                    'fullName' => $user['fullName'],
                    'email' => $user['email'],
                    'profilePicture' => $user['profilePicture'],
                    'isEmailVerified' => true,
                    'authProvider' => $user['authProvider']
                ]
            ]);
            
        } catch (Exception $e) {
            error_log('OTP verification error: ' . $e->getMessage());
            Response::error('Server error during verification: ' . $e->getMessage(), 500);
        }
    }
}
?>
