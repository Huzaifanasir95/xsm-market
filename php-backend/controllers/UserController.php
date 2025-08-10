<?php
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';

class UserController {
    
    // Helper function to check if username is available
    private static function isUsernameAvailable($username, $currentUserId = null) {
        $pdo = Database::getConnection();
        $sql = "SELECT id FROM users WHERE username = ?";
        $params = [$username];
        
        if ($currentUserId) {
            $sql .= " AND id != ?";
            $params[] = $currentUserId;
        }
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount() === 0;
    }
    
    // Get user profile
    public function getProfile() {
        try {
            $user = AuthMiddleware::authenticate();
            
            $stmt = Database::getConnection()->prepare("
                SELECT id, username, email, profilePicture, description, isEmailVerified, authProvider, createdAt 
                FROM users WHERE id = ?
            ");
            $stmt->execute([$user['id']]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$userData) {
                Response::error('User not found', 404);
                return;
            }
            
            Response::json([
                'user' => [
                    'id' => (int)$userData['id'],
                    'username' => $userData['username'],
                    'email' => $userData['email'],
                    'profilePicture' => $userData['profilePicture'],
                    'description' => $userData['description'],
                    'isEmailVerified' => (bool)$userData['isEmailVerified'],
                    'authProvider' => $userData['authProvider'],
                    'createdAt' => $userData['createdAt']
                ]
            ]);
        } catch (Exception $e) {
            error_log('Get profile error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Update username
    public function updateUsername() {
        try {
            $user = AuthMiddleware::authenticate();
            $input = json_decode(file_get_contents('php://input'), true);
            $username = $input['username'] ?? null;
            
            // Validation
            if (!$username) {
                Response::error('Username is required', 400);
                return;
            }
            
            if (strlen($username) < 3 || strlen($username) > 50) {
                Response::error('Username must be between 3 and 50 characters', 400);
                return;
            }
            
            if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
                Response::error('Username can only contain letters, numbers, and underscores', 400);
                return;
            }
            
            // Check if username is available
            if (!self::isUsernameAvailable($username, $user['id'])) {
                Response::error('Username is already taken', 400);
                return;
            }
            
            $pdo = Database::getConnection();
            
            // Update username
            $stmt = $pdo->prepare("UPDATE users SET username = ? WHERE id = ?");
            $stmt->execute([$username, $user['id']]);
            
            // Get updated user data
            $stmt = $pdo->prepare("
                SELECT id, username, email, profilePicture, description, isEmailVerified, authProvider 
                FROM users WHERE id = ?
            ");
            $stmt->execute([$user['id']]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            error_log("Username updated for user {$user['id']}: -> $username");
            
            Response::success([
                'message' => 'Username updated successfully',
                'user' => [
                    'id' => (int)$userData['id'],
                    'username' => $userData['username'],
                    'email' => $userData['email'],
                    'profilePicture' => $userData['profilePicture'],
                    'description' => $userData['description'],
                    'isEmailVerified' => (bool)$userData['isEmailVerified'],
                    'authProvider' => $userData['authProvider']
                ]
            ]);
        } catch (Exception $e) {
            error_log('Update username error: ' . $e->getMessage());
            if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
                Response::error('Username is already taken', 400);
            } else {
                Response::error('Server error: ' . $e->getMessage(), 500);
            }
        }
    }
    
    // Update profile picture
    public function updateProfilePicture() {
        try {
            $user = AuthMiddleware::authenticate();
            $input = json_decode(file_get_contents('php://input'), true);
            $profilePicture = $input['profilePicture'] ?? '';
            
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("UPDATE users SET profilePicture = ? WHERE id = ?");
            $stmt->execute([$profilePicture, $user['id']]);
            
            // Get updated user data
            $stmt = $pdo->prepare("
                SELECT id, username, email, profilePicture, description, isEmailVerified, authProvider 
                FROM users WHERE id = ?
            ");
            $stmt->execute([$user['id']]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            error_log("Profile picture updated for user {$user['id']}");
            
            Response::success([
                'message' => 'Profile picture updated successfully',
                'user' => [
                    'id' => (int)$userData['id'],
                    'username' => $userData['username'],
                    'email' => $userData['email'],
                    'profilePicture' => $userData['profilePicture'],
                    'description' => $userData['description'],
                    'isEmailVerified' => (bool)$userData['isEmailVerified'],
                    'authProvider' => $userData['authProvider']
                ]
            ]);
        } catch (Exception $e) {
            error_log('Update profile picture error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Update full profile (username and profile picture)
    public function updateProfile() {
        try {
            $user = AuthMiddleware::authenticate();
            $input = json_decode(file_get_contents('php://input'), true);
            
            $username = $input['username'] ?? null;
            $profilePicture = $input['profilePicture'] ?? null;
            $description = $input['description'] ?? null;
            
            $updates = [];
            $params = [];
            $changes = [];
            
            $pdo = Database::getConnection();
            
            // Get current user data
            $stmt = $pdo->prepare("SELECT username, profilePicture, description FROM users WHERE id = ?");
            $stmt->execute([$user['id']]);
            $currentUser = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Update username if provided and different
            if ($username !== null && $username !== $currentUser['username']) {
                // Validation
                if (strlen($username) < 3 || strlen($username) > 50) {
                    Response::error('Username must be between 3 and 50 characters', 400);
                    return;
                }
                
                if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
                    Response::error('Username can only contain letters, numbers, and underscores', 400);
                    return;
                }
                
                // Check if username is available
                if (!self::isUsernameAvailable($username, $user['id'])) {
                    Response::error('Username is already taken', 400);
                    return;
                }
                
                $updates[] = "username = ?";
                $params[] = $username;
                $changes[] = "username: {$currentUser['username']} -> $username";
            }
            
            // Update profile picture if provided and different
            if ($profilePicture !== null && $profilePicture !== $currentUser['profilePicture']) {
                $updates[] = "profilePicture = ?";
                $params[] = $profilePicture;
                $changes[] = 'profile picture updated';
            }

            // Update description if provided and different
            if ($description !== null && $description !== $currentUser['description']) {
                $updates[] = "description = ?";
                $params[] = $description;
                $changes[] = 'description updated';
            }
            
            // Apply updates if any
            if (!empty($updates)) {
                $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
                $params[] = $user['id'];
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                
                error_log("Profile updated for user {$user['id']}: " . implode(', ', $changes));
            }
            
            // Get updated user data
            $stmt = $pdo->prepare("
                SELECT id, username, email, profilePicture, description, isEmailVerified, authProvider 
                FROM users WHERE id = ?
            ");
            $stmt->execute([$user['id']]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            Response::success([
                'message' => 'Profile updated successfully',
                'user' => [
                    'id' => (int)$userData['id'],
                    'username' => $userData['username'],
                    'email' => $userData['email'],
                    'profilePicture' => $userData['profilePicture'],
                    'description' => $userData['description'],
                    'isEmailVerified' => (bool)$userData['isEmailVerified'],
                    'authProvider' => $userData['authProvider']
                ]
            ]);
        } catch (Exception $e) {
            error_log('Update profile error: ' . $e->getMessage());
            if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
                Response::error('Username is already taken', 400);
            } else {
                Response::error('Server error: ' . $e->getMessage(), 500);
            }
        }
    }
    
    // Check username availability
    public function checkUsernameAvailability() {
        try {
            $user = AuthMiddleware::authenticate();
            $username = $_GET['username'] ?? null;
            
            if (!$username) {
                Response::error('Username is required', 400);
                return;
            }
            
            if (strlen($username) < 3 || strlen($username) > 50) {
                Response::json([
                    'available' => false,
                    'message' => 'Username must be between 3 and 50 characters'
                ], 400);
                return;
            }
            
            if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
                Response::json([
                    'available' => false,
                    'message' => 'Username can only contain letters, numbers, and underscores'
                ], 400);
                return;
            }
            
            $isAvailable = self::isUsernameAvailable($username, $user['id']);
            
            Response::json([
                'available' => $isAvailable,
                'message' => $isAvailable ? 'Username is available' : 'Username is already taken'
            ]);
        } catch (Exception $e) {
            error_log('Check username availability error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Change password
    public function changePassword() {
        try {
            $user = AuthMiddleware::authenticate();
            $input = json_decode(file_get_contents('php://input'), true);
            
            $currentPassword = $input['currentPassword'] ?? null;
            $newPassword = $input['newPassword'] ?? null;
            
            // Validation
            if (!$newPassword) {
                Response::error('New password is required', 400);
                return;
            }
            
            if (strlen($newPassword) < 6) {
                Response::error('New password must be at least 6 characters long', 400);
                return;
            }
            
            $pdo = Database::getConnection();
            
            // Get current user data
            $stmt = $pdo->prepare("SELECT password, authProvider FROM users WHERE id = ?");
            $stmt->execute([$user['id']]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$userData) {
                Response::error('User not found', 404);
                return;
            }
            
            // Handle Google users (they can set password without providing current password)
            if ($userData['authProvider'] === 'google') {
                if ($currentPassword) {
                    Response::error('This account was created with Google OAuth. Please use "Sign in with Google" instead. To set a password for email login, leave the current password field empty.', 400, [
                        'authProvider' => 'google'
                    ]);
                    return;
                }
                
                // Set password for Google user (keep authProvider as 'google' but now they have password)
                $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
                $stmt->execute([$hashedPassword, $user['id']]);
                
                error_log("Password set for Google user {$user['id']}, can now login with email/password too");
                
                Response::json([
                    'message' => 'Password set successfully! You can now login with email/password in addition to Google.'
                ]);
                return;
            }
            
            // Handle email users (existing password required)
            if ($userData['authProvider'] === 'email') {
                if (!$currentPassword) {
                    Response::error('Current password is required', 400);
                    return;
                }
                
                // Verify current password
                if (!password_verify($currentPassword, $userData['password'])) {
                    Response::error('Current password is incorrect', 400);
                    return;
                }
            }
            
            // Update password
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
            $stmt->execute([$hashedPassword, $user['id']]);
            
            error_log("Password changed for user {$user['id']}");
            
            Response::json(['message' => 'Password changed successfully']);
        } catch (Exception $e) {
            error_log('Change password error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }

    // Change email - Step 1: Request email change and send verification
    public function requestEmailChange() {
        try {
            $user = AuthMiddleware::authenticate();
            $input = json_decode(file_get_contents('php://input'), true);
            
            $newEmail = $input['newEmail'] ?? null;
            
            if (!$newEmail) {
                Response::error('New email is required', 400);
                return;
            }

            $newEmail = filter_var(trim($newEmail), FILTER_VALIDATE_EMAIL);
            if (!$newEmail) {
                Response::error('Invalid email format', 400);
                return;
            }

            $pdo = Database::getConnection();

            // Check if new email is already in use
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
            $stmt->execute([$newEmail, $user['id']]);
            if ($stmt->fetch()) {
                Response::error('Email is already in use', 400);
                return;
            }

            // Get current user info
            $stmt = $pdo->prepare("SELECT username, email FROM users WHERE id = ?");
            $stmt->execute([$user['id']]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$userData) {
                Response::error('User not found', 404);
                return;
            }

            // Generate verification token and OTP
            $verificationToken = bin2hex(random_bytes(32));
            $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $otpExpires = date('Y-m-d H:i:s', strtotime('+15 minutes'));

            // Store email change request
            $stmt = $pdo->prepare("
                UPDATE users 
                SET pendingEmail = ?, emailChangeToken = ?, emailOTP = ?, otpExpires = ? 
                WHERE id = ?
            ");
            $stmt->execute([$newEmail, $verificationToken, $otp, $otpExpires, $user['id']]);

            // Send verification email to new email address
            require_once __DIR__ . '/../utils/EmailService.php';
            $emailService = new EmailService();
            $emailSent = $emailService->sendEmailChangeVerification($newEmail, $otp, $userData['username'], $verificationToken);

            if ($emailSent) {
                Response::json([
                    'message' => 'Verification email sent to new email address',
                    'newEmail' => $newEmail,
                    'verificationToken' => $verificationToken
                ]);
            } else {
                Response::error('Failed to send verification email', 500);
            }

        } catch (Exception $e) {
            error_log('Request email change error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }

    // Change email - Step 2: Verify and complete email change
    public function verifyEmailChange() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            $token = $input['token'] ?? null;
            $otp = $input['otp'] ?? null;

            if (!$token || !$otp) {
                Response::error('Token and OTP are required', 400);
                return;
            }

            $pdo = Database::getConnection();

            // Find user with matching token and OTP
            $stmt = $pdo->prepare("
                SELECT id, username, email, pendingEmail, emailOTP, otpExpires 
                FROM users 
                WHERE emailChangeToken = ? AND emailOTP = ? AND otpExpires > NOW()
            ");
            $stmt->execute([$token, $otp]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$userData) {
                Response::error('Invalid or expired verification code', 400);
                return;
            }

            $oldEmail = $userData['email'];
            $newEmail = $userData['pendingEmail'];

            // Update email and clear pending change data
            $stmt = $pdo->prepare("
                UPDATE users 
                SET email = ?, pendingEmail = NULL, emailChangeToken = NULL, 
                    emailOTP = NULL, otpExpires = NULL, isEmailVerified = 1
                WHERE id = ?
            ");
            $stmt->execute([$newEmail, $userData['id']]);

            // Send confirmation email to old email
            require_once __DIR__ . '/../utils/EmailService.php';
            $emailService = new EmailService();
            $emailService->sendEmailChangeNotification($oldEmail, $newEmail, $userData['username']);

            Response::json([
                'message' => 'Email address successfully changed',
                'newEmail' => $newEmail
            ]);

        } catch (Exception $e) {
            error_log('Verify email change error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
}
?>
