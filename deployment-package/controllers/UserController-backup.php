<?php
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../config/database.php';

class UserController {
    private $db;
    private $authMiddleware;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->authMiddleware = new AuthMiddleware();
    }
    
    // Helper function to check if username is available
    private function isUsernameAvailable($username, $currentUserId = null) {
        $sql = "SELECT id FROM users WHERE username = ?";
        $params = [$username];
        
        if ($currentUserId) {
            $sql .= " AND id != ?";
            $params[] = $currentUserId;
        }
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount() === 0;
    }
    
    // Get user profile
    public function getProfile() {
        try {
            $user = $this->authMiddleware->authenticate();
            
            $stmt = $this->db->prepare("
                SELECT id, username, fullName, email, profilePicture, isEmailVerified, authProvider, createdAt 
                FROM users WHERE id = ?
            ");
            $stmt->execute([$user['id']]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$userData) {
                http_response_code(404);
                echo json_encode(['message' => 'User not found']);
                return;
            }
            
            http_response_code(200);
            echo json_encode([
                'user' => [
                    'id' => (int)$userData['id'],
                    'username' => $userData['username'],
                    'fullName' => $userData['fullName'],
                    'email' => $userData['email'],
                    'profilePicture' => $userData['profilePicture'],
                    'isEmailVerified' => (bool)$userData['isEmailVerified'],
                    'authProvider' => $userData['authProvider'],
                    'createdAt' => $userData['createdAt']
                ]
            ]);
        } catch (Exception $e) {
            error_log('Get profile error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['message' => 'Server error', 'error' => $e->getMessage()]);
        }
    }
    
    // Update username
    public function updateUsername() {
        try {
            $user = $this->authMiddleware->authenticate();
            $input = json_decode(file_get_contents('php://input'), true);
            $username = $input['username'] ?? null;
            
            // Validation
            if (!$username) {
                http_response_code(400);
                echo json_encode(['message' => 'Username is required']);
                return;
            }
            
            if (strlen($username) < 3 || strlen($username) > 50) {
                http_response_code(400);
                echo json_encode(['message' => 'Username must be between 3 and 50 characters']);
                return;
            }
            
            if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
                http_response_code(400);
                echo json_encode(['message' => 'Username can only contain letters, numbers, and underscores']);
                return;
            }
            
            // Check if username is available
            if (!$this->isUsernameAvailable($username, $user['id'])) {
                http_response_code(400);
                echo json_encode(['message' => 'Username is already taken']);
                return;
            }
            
            // Update username
            $stmt = $this->db->prepare("UPDATE users SET username = ? WHERE id = ?");
            $stmt->execute([$username, $user['id']]);
            
            // Get updated user data
            $stmt = $this->db->prepare("
                SELECT id, username, email, profilePicture, isEmailVerified, authProvider 
                FROM users WHERE id = ?
            ");
            $stmt->execute([$user['id']]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            error_log("Username updated for user {$user['id']}: -> $username");
            
            http_response_code(200);
            echo json_encode([
                'message' => 'Username updated successfully',
                'user' => [
                    'id' => (int)$userData['id'],
                    'username' => $userData['username'],
                    'email' => $userData['email'],
                    'profilePicture' => $userData['profilePicture'],
                    'isEmailVerified' => (bool)$userData['isEmailVerified'],
                    'authProvider' => $userData['authProvider']
                ]
            ]);
        } catch (Exception $e) {
            error_log('Update username error: ' . $e->getMessage());
            if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
                http_response_code(400);
                echo json_encode(['message' => 'Username is already taken']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Server error', 'error' => $e->getMessage()]);
            }
        }
    }
    
    // Update profile picture
    public function updateProfilePicture() {
        try {
            $user = $this->authMiddleware->authenticate();
            $input = json_decode(file_get_contents('php://input'), true);
            $profilePicture = $input['profilePicture'] ?? '';
            
            $stmt = $this->db->prepare("UPDATE users SET profilePicture = ? WHERE id = ?");
            $stmt->execute([$profilePicture, $user['id']]);
            
            // Get updated user data
            $stmt = $this->db->prepare("
                SELECT id, username, email, profilePicture, isEmailVerified, authProvider 
                FROM users WHERE id = ?
            ");
            $stmt->execute([$user['id']]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            error_log("Profile picture updated for user {$user['id']}");
            
            http_response_code(200);
            echo json_encode([
                'message' => 'Profile picture updated successfully',
                'user' => [
                    'id' => (int)$userData['id'],
                    'username' => $userData['username'],
                    'email' => $userData['email'],
                    'profilePicture' => $userData['profilePicture'],
                    'isEmailVerified' => (bool)$userData['isEmailVerified'],
                    'authProvider' => $userData['authProvider']
                ]
            ]);
        } catch (Exception $e) {
            error_log('Update profile picture error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['message' => 'Server error', 'error' => $e->getMessage()]);
        }
    }
    
    // Update full profile (username, full name, profile picture)
    public function updateProfile() {
        try {
            $user = $this->authMiddleware->authenticate();
            $input = json_decode(file_get_contents('php://input'), true);
            
            $username = $input['username'] ?? null;
            $fullName = $input['fullName'] ?? null;
            $profilePicture = $input['profilePicture'] ?? null;
            
            $updates = [];
            $params = [];
            $changes = [];
            
            // Get current user data
            $stmt = $this->db->prepare("SELECT username, fullName, profilePicture FROM users WHERE id = ?");
            $stmt->execute([$user['id']]);
            $currentUser = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Update username if provided
            if ($username && $username !== $currentUser['username']) {
                // Validation
                if (strlen($username) < 3 || strlen($username) > 50) {
                    http_response_code(400);
                    echo json_encode(['message' => 'Username must be between 3 and 50 characters']);
                    return;
                }
                
                if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
                    http_response_code(400);
                    echo json_encode(['message' => 'Username can only contain letters, numbers, and underscores']);
                    return;
                }
                
                // Check if username is available
                if (!$this->isUsernameAvailable($username, $user['id'])) {
                    http_response_code(400);
                    echo json_encode(['message' => 'Username is already taken']);
                    return;
                }
                
                $updates[] = "username = ?";
                $params[] = $username;
                $changes[] = "username: {$currentUser['username']} -> $username";
            }
            
            // Update full name if provided
            if ($fullName !== null && $fullName !== $currentUser['fullName']) {
                if (strlen($fullName) > 100) {
                    http_response_code(400);
                    echo json_encode(['message' => 'Full name must be less than 100 characters']);
                    return;
                }
                
                $updates[] = "fullName = ?";
                $params[] = $fullName;
                $changes[] = 'full name updated';
            }
            
            // Update profile picture if provided
            if ($profilePicture !== null && $profilePicture !== $currentUser['profilePicture']) {
                $updates[] = "profilePicture = ?";
                $params[] = $profilePicture;
                $changes[] = 'profile picture updated';
            }
            
            // Apply updates
            if (!empty($updates)) {
                $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
                $params[] = $user['id'];
                $stmt = $this->db->prepare($sql);
                $stmt->execute($params);
                error_log("Profile updated for user {$user['id']}: " . implode(', ', $changes));
            }
            
            // Get updated user data
            $stmt = $this->db->prepare("
                SELECT id, username, fullName, email, profilePicture, isEmailVerified, authProvider 
                FROM users WHERE id = ?
            ");
            $stmt->execute([$user['id']]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            http_response_code(200);
            echo json_encode([
                'message' => 'Profile updated successfully',
                'user' => [
                    'id' => (int)$userData['id'],
                    'username' => $userData['username'],
                    'fullName' => $userData['fullName'],
                    'email' => $userData['email'],
                    'profilePicture' => $userData['profilePicture'],
                    'isEmailVerified' => (bool)$userData['isEmailVerified'],
                    'authProvider' => $userData['authProvider']
                ]
            ]);
        } catch (Exception $e) {
            error_log('Update profile error: ' . $e->getMessage());
            if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
                http_response_code(400);
                echo json_encode(['message' => 'Username is already taken']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Server error', 'error' => $e->getMessage()]);
            }
        }
    }
    
    // Check username availability
    public function checkUsernameAvailability() {
        try {
            $user = $this->authMiddleware->authenticate();
            $username = $_GET['username'] ?? null;
            
            if (!$username) {
                http_response_code(400);
                echo json_encode(['message' => 'Username is required']);
                return;
            }
            
            if (strlen($username) < 3 || strlen($username) > 50) {
                http_response_code(400);
                echo json_encode([
                    'available' => false,
                    'message' => 'Username must be between 3 and 50 characters'
                ]);
                return;
            }
            
            if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
                http_response_code(400);
                echo json_encode([
                    'available' => false,
                    'message' => 'Username can only contain letters, numbers, and underscores'
                ]);
                return;
            }
            
            $isAvailable = $this->isUsernameAvailable($username, $user['id']);
            
            http_response_code(200);
            echo json_encode([
                'available' => $isAvailable,
                'message' => $isAvailable ? 'Username is available' : 'Username is already taken'
            ]);
        } catch (Exception $e) {
            error_log('Check username availability error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['message' => 'Server error', 'error' => $e->getMessage()]);
        }
    }
    
    // Change password
    public function changePassword() {
        try {
            $user = $this->authMiddleware->authenticate();
            $input = json_decode(file_get_contents('php://input'), true);
            
            $currentPassword = $input['currentPassword'] ?? null;
            $newPassword = $input['newPassword'] ?? null;
            
            // Validation
            if (!$newPassword) {
                http_response_code(400);
                echo json_encode(['message' => 'New password is required']);
                return;
            }
            
            if (strlen($newPassword) < 6) {
                http_response_code(400);
                echo json_encode(['message' => 'New password must be at least 6 characters long']);
                return;
            }
            
            // Get current user data
            $stmt = $this->db->prepare("SELECT password, authProvider FROM users WHERE id = ?");
            $stmt->execute([$user['id']]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$userData) {
                http_response_code(404);
                echo json_encode(['message' => 'User not found']);
                return;
            }
            
            // Handle Google users (they can set password without providing current password)
            if ($userData['authProvider'] === 'google') {
                if ($currentPassword) {
                    http_response_code(400);
                    echo json_encode([
                        'message' => 'Google account users don\'t have a current password. Leave current password empty to set a new password.'
                    ]);
                    return;
                }
                
                // Set password for Google user
                $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
                $stmt = $this->db->prepare("UPDATE users SET password = ? WHERE id = ?");
                $stmt->execute([$hashedPassword, $user['id']]);
                
                error_log("Password set for Google user {$user['id']}");
                
                http_response_code(200);
                echo json_encode([
                    'message' => 'Password set successfully! You can now login with email/password in addition to Google.'
                ]);
                return;
            }
            
            // Handle email users (existing password required)
            if ($userData['authProvider'] === 'email') {
                if (!$currentPassword) {
                    http_response_code(400);
                    echo json_encode(['message' => 'Current password is required']);
                    return;
                }
                
                // Verify current password
                if (!password_verify($currentPassword, $userData['password'])) {
                    http_response_code(400);
                    echo json_encode(['message' => 'Current password is incorrect']);
                    return;
                }
            }
            
            // Update password
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            $stmt = $this->db->prepare("UPDATE users SET password = ? WHERE id = ?");
            $stmt->execute([$hashedPassword, $user['id']]);
            
            error_log("Password changed for user {$user['id']}");
            
            http_response_code(200);
            echo json_encode(['message' => 'Password changed successfully']);
        } catch (Exception $e) {
            error_log('Change password error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['message' => 'Server error', 'error' => $e->getMessage()]);
        }
    }
}
    
    // Check username availability
    public function checkUsername() {
        $input = json_decode(file_get_contents('php://input'), true);
        $username = trim($input['username'] ?? '');
        
        if (!$username) {
            Response::error('Username is required', 400);
        }
        
        if (!Validation::isValidUsername($username)) {
            Response::error('Username must be 3-30 characters long and contain only letters, numbers, and underscores', 400);
        }
        
        try {
            $isAvailable = User::isUsernameAvailable($username);
            
            Response::json([
                'available' => $isAvailable,
                'username' => $username
            ]);
            
        } catch (Exception $e) {
            error_log('Username check error: ' . $e->getMessage());
            Response::error('Server error', 500);
        }
    }
    
    // Get user by ID (public profile)
    public function getUserById($userId) {
        try {
            $user = User::findById($userId);
            
            if (!$user) {
                Response::error('User not found', 404);
            }
            
            // Return only public information
            $publicUser = [
                'id' => $user['id'],
                'username' => $user['username'],
                'fullName' => $user['fullName'],
                'profilePicture' => $user['profilePicture'],
                'location' => $user['location'],
                'bio' => $user['bio'],
                'createdAt' => $user['createdAt']
            ];
            
            Response::json($publicUser);
            
        } catch (Exception $e) {
            error_log('Get user error: ' . $e->getMessage());
            Response::error('Server error', 500);
        }
    }
}
?>
