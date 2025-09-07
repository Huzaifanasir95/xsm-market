<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/EmailService.php';
require_once __DIR__ . '/../utils/jwt.php';

class AuthController {
    
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
        
        if (!Validation::isValidEmail($email)) {
            Response::error('Please provide a valid email address', 400);
        }
        
        if (!Validation::isValidUsername($username)) {
            Response::error('Username must be 3-30 characters long and contain only letters, numbers, and underscores', 400);
        }
        
        try {
            // Check if user already exists and is verified
            $existingUserByEmail = User::findByEmail($email);
            $existingUserByUsername = User::findByUsername($username);
            
            if ($existingUserByEmail && $existingUserByEmail['isEmailVerified']) {
                Response::error('Email already registered and verified', 400);
            }
            
            if ($existingUserByUsername && $existingUserByUsername['isEmailVerified']) {
                Response::error('Username already taken', 400);
            }
            
            // If user exists but not verified, update their details and resend OTP
            if ($existingUserByEmail && !$existingUserByEmail['isEmailVerified']) {
                $otp = User::generateOTP();
                $otpExpires = date('Y-m-d H:i:s', time() + (15 * 60)); // 15 minutes
                
                User::update($existingUserByEmail['id'], [
                    'username' => $username,
                    'fullName' => $fullName,
                    'password' => $password, // Will be hashed in the model
                    'emailOTP' => $otp,
                    'otpExpires' => $otpExpires
                ]);
                
                // Send OTP email
                $emailResult = EmailService::sendOTPEmail($email, $otp, $username);
                if (!$emailResult) {
                    Response::error('Failed to send verification email', 500);
                }
                
                Response::success([
                    'message' => 'Verification OTP sent to your email',
                    'email' => $email,
                    'requiresVerification' => true
                ]);
            }
            
            // Create new unverified user
            $otp = User::generateOTP();
            $otpExpires = date('Y-m-d H:i:s', time() + (15 * 60)); // 15 minutes
            
            $userId = User::create([
                'username' => $username,
                'fullName' => $fullName,
                'email' => $email,
                'password' => $password,
                'isEmailVerified' => false,
                'emailOTP' => $otp,
                'otpExpires' => $otpExpires
            ]);
            
            // Send OTP email
            $emailResult = EmailService::sendOTPEmail($email, $otp, $username);
            if (!$emailResult) {
                Response::error('Failed to send verification email', 500);
            }
            
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
    
    // Verify OTP
    public function verifyOTP() {
        $input = json_decode(file_get_contents('php://input'), true);
        $email = trim($input['email'] ?? '');
        $otp = trim($input['otp'] ?? '');
        
        if (!$email || !$otp) {
            Response::error('Please provide email and OTP', 400);
        }
        
        try {
            $user = User::findByEmail($email);
            if (!$user) {
                Response::error('User not found', 404);
            }
            
            if ($user['isEmailVerified']) {
                Response::error('Email already verified', 400);
            }
            
            if (!$user['emailOTP'] || $user['emailOTP'] !== $otp) {
                Response::error('Invalid OTP', 400);
            }
            
            if ($user['otpExpires'] && strtotime($user['otpExpires']) < time()) {
                Response::error('OTP has expired', 400);
            }
            
            // Verify user
            User::update($user['id'], [
                'isEmailVerified' => true,
                'emailOTP' => null,
                'otpExpires' => null
            ]);
            
            // Send welcome email
            EmailService::sendWelcomeEmail($email, $user['username']);
            
            // Generate tokens
            $tokens = JWT::generateTokens($user['id']);
            
            // Get updated user data
            $updatedUser = User::findById($user['id']);
            unset($updatedUser['password'], $updatedUser['emailOTP'], $updatedUser['passwordResetToken']);
            
            Response::success([
                'message' => 'Email verified successfully',
                'user' => $updatedUser,
                'accessToken' => $tokens['accessToken'],
                'refreshToken' => $tokens['refreshToken']
            ]);
            
        } catch (Exception $e) {
            error_log('OTP verification error: ' . $e->getMessage());
            Response::error('Server error during verification: ' . $e->getMessage(), 500);
        }
    }
    
    // Login user
    public function login() {
        $input = json_decode(file_get_contents('php://input'), true);
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        
        // Log login attempt (filter out password)
        error_log('Login attempt: ' . json_encode(['email' => $email]));
        
        // Validation
        if (!$email || !$password) {
            Response::error('Please provide email and password', 400);
        }
        
        try {
            // Find user
            $user = User::findByEmail($email);
            if (!$user) {
                Response::error('Invalid credentials', 401);
            }
            
            // Check if email is verified (only for email auth users)
            if ($user['authProvider'] === 'email' && !$user['isEmailVerified']) {
                Response::error('Please verify your email before logging in. Check your inbox for the verification OTP.', 403);
            }
            
            // Check if user is banned
            if ($user['isBanned']) {
                Response::error('Your account has been banned. Please contact support.', 403);
            }
            
            // Verify password
            if (!User::verifyPassword($password, $user['password'])) {
                Response::error('Invalid credentials', 401);
            }
            
            // Generate tokens
            $tokens = JWT::generateTokens($user['id']);
            
            // Remove sensitive data
            unset($user['password'], $user['emailOTP'], $user['passwordResetToken']);
            
            Response::success([
                'message' => 'Login successful',
                'user' => $user,
                'accessToken' => $tokens['accessToken'],
                'refreshToken' => $tokens['refreshToken']
            ]);
            
        } catch (Exception $e) {
            error_log('Login error: ' . $e->getMessage());
            Response::error('Server error during login: ' . $e->getMessage(), 500);
        }
    }
    
    // Google authentication
    public function googleAuth() {
        $input = json_decode(file_get_contents('php://input'), true);
        $idToken = $input['idToken'] ?? '';
        
        if (!$idToken) {
            Response::error('Google ID token is required', 400);
        }
        
        try {
            // Verify Google token (implement Google OAuth verification)
            $googleUser = $this->verifyGoogleToken($idToken);
            
            if (!$googleUser) {
                Response::error('Invalid Google token', 401);
            }
            
            // Check if user exists
            $user = User::findByGoogleId($googleUser['sub']);
            
            if (!$user) {
                // Check if email is already registered
                $existingUser = User::findByEmail($googleUser['email']);
                if ($existingUser) {
                    Response::error('An account with this email already exists. Please use email/password login.', 400);
                }
                
                // Create new user
                $username = User::generateUniqueUsername($googleUser['name'] ?? $googleUser['email']);
                
                $userId = User::create([
                    'username' => $username,
                    'fullName' => $googleUser['name'] ?? '',
                    'email' => $googleUser['email'],
                    'profilePicture' => $googleUser['picture'] ?? '',
                    'googleId' => $googleUser['sub'],
                    'authProvider' => 'google',
                    'isEmailVerified' => true
                ]);
                
                $user = User::findById($userId);
                
                // Send welcome email
                EmailService::sendWelcomeEmail($user['email'], $user['username']);
            }
            
            // Check if user is banned
            if ($user['isBanned']) {
                Response::error('Your account has been banned. Please contact support.', 403);
            }
            
            // Generate tokens
            $tokens = JWT::generateTokens($user['id']);
            
            // Remove sensitive data
            unset($user['password'], $user['emailOTP'], $user['passwordResetToken']);
            
            Response::success([
                'message' => 'Google authentication successful',
                'user' => $user,
                'accessToken' => $tokens['accessToken'],
                'refreshToken' => $tokens['refreshToken']
            ]);
            
        } catch (Exception $e) {
            error_log('Google auth error: ' . $e->getMessage());
            Response::error('Server error during Google authentication: ' . $e->getMessage(), 500);
        }
    }
    
    // Refresh token
    public function refreshToken() {
        $input = json_decode(file_get_contents('php://input'), true);
        $refreshToken = $input['refreshToken'] ?? '';
        
        if (!$refreshToken) {
            Response::error('Refresh token is required', 400);
        }
        
        try {
            $payload = JWT::decode($refreshToken, 'refresh');
            
            if (!isset($payload['userId']) || $payload['type'] !== 'refresh') {
                Response::error('Invalid refresh token', 401);
            }
            
            // Get user
            $user = User::findById($payload['userId']);
            if (!$user || $user['isBanned']) {
                Response::error('User not found or banned', 401);
            }
            
            // Generate new tokens
            $tokens = JWT::generateTokens($user['id']);
            
            Response::success([
                'accessToken' => $tokens['accessToken'],
                'refreshToken' => $tokens['refreshToken']
            ]);
            
        } catch (Exception $e) {
            error_log('Refresh token error: ' . $e->getMessage());
            Response::error('Invalid or expired refresh token', 401);
        }
    }
    
    // Logout (client-side token removal)
    public function logout() {
        Response::success(['message' => 'Logout successful']);
    }
    
    // Forgot password
    public function forgotPassword() {
        $input = json_decode(file_get_contents('php://input'), true);
        $email = trim($input['email'] ?? '');
        
        if (!$email) {
            Response::error('Email is required', 400);
        }
        
        try {
            $user = User::findByEmail($email);
            if (!$user) {
                // Don't reveal if email exists or not
                Response::success(['message' => 'If an account with that email exists, a password reset link has been sent.']);
            }
            
            // Generate reset token
            $resetToken = User::generateResetToken();
            $resetExpires = date('Y-m-d H:i:s', time() + (60 * 60)); // 1 hour
            
            User::update($user['id'], [
                'passwordResetToken' => $resetToken,
                'passwordResetExpires' => $resetExpires
            ]);
            
            // Send reset email
            $emailResult = EmailService::sendPasswordResetEmail($email, $resetToken);
            if (!$emailResult) {
                Response::error('Failed to send password reset email', 500);
            }
            
            Response::success(['message' => 'If an account with that email exists, a password reset link has been sent.']);
            
        } catch (Exception $e) {
            error_log('Forgot password error: ' . $e->getMessage());
            Response::error('Server error', 500);
        }
    }
    
    // Reset password
    public function resetPassword() {
        $input = json_decode(file_get_contents('php://input'), true);
        $token = $input['token'] ?? '';
        $newPassword = $input['password'] ?? '';
        
        if (!$token || !$newPassword) {
            Response::error('Token and new password are required', 400);
        }
        
        if (strlen($newPassword) < 6) {
            Response::error('Password must be at least 6 characters long', 400);
        }
        
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("SELECT * FROM users WHERE passwordResetToken = :token AND passwordResetExpires > NOW()");
            $stmt->execute([':token' => $token]);
            $user = $stmt->fetch();
            
            if (!$user) {
                Response::error('Invalid or expired reset token', 400);
            }
            
            // Update password
            User::update($user['id'], [
                'password' => $newPassword, // Will be hashed in the model
                'passwordResetToken' => null,
                'passwordResetExpires' => null
            ]);
            
            Response::success(['message' => 'Password reset successful']);
            
        } catch (Exception $e) {
            error_log('Reset password error: ' . $e->getMessage());
            Response::error('Server error', 500);
        }
    }
    
    // Change password (authenticated user)
    public function changePassword() {
        $user = AuthMiddleware::authenticate();
        
        $input = json_decode(file_get_contents('php://input'), true);
        $currentPassword = $input['currentPassword'] ?? '';
        $newPassword = $input['newPassword'] ?? '';
        
        if (!$currentPassword || !$newPassword) {
            Response::error('Current password and new password are required', 400);
        }
        
        if (strlen($newPassword) < 6) {
            Response::error('New password must be at least 6 characters long', 400);
        }
        
        try {
            // Verify current password
            if (!User::verifyPassword($currentPassword, $user['password'])) {
                Response::error('Current password is incorrect', 400);
            }
            
            // Update password
            User::update($user['id'], ['password' => $newPassword]);
            
            Response::success(['message' => 'Password changed successfully']);
            
        } catch (Exception $e) {
            error_log('Change password error: ' . $e->getMessage());
            Response::error('Server error', 500);
        }
    }
    
    // Verify reset token
    public function verifyResetToken() {
        $input = json_decode(file_get_contents('php://input'), true);
        $token = $input['token'] ?? '';
        
        if (!$token) {
            Response::error('Token is required', 400);
        }
        
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("SELECT id FROM users WHERE passwordResetToken = :token AND passwordResetExpires > NOW()");
            $stmt->execute([':token' => $token]);
            $user = $stmt->fetch();
            
            if (!$user) {
                Response::error('Invalid or expired reset token', 400);
            }
            
            Response::success(['message' => 'Token is valid']);
            
        } catch (Exception $e) {
            error_log('Verify reset token error: ' . $e->getMessage());
            Response::error('Server error', 500);
        }
    }
    
    private function verifyGoogleToken($idToken) {
        // Implement Google OAuth token verification
        // For now, return mock data - implement proper Google OAuth verification
        // You would use Google's OAuth2 library to verify the token
        
        // Mock implementation - replace with actual Google token verification
        return [
            'sub' => 'google_user_id',
            'email' => 'user@example.com',
            'name' => 'User Name',
            'picture' => 'https://example.com/picture.jpg'
        ];
    }
}
?>
