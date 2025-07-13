<?php
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Ad.php';
require_once __DIR__ . '/../utils/Response.php';

class AdminController {
    
    // Get all users (admin only)
    public function getUsers() {
        $admin = AuthMiddleware::requireAdmin();
        
        $page = intval($_GET['page'] ?? 1);
        $limit = intval($_GET['limit'] ?? 50);
        $search = $_GET['search'] ?? '';
        $offset = ($page - 1) * $limit;
        
        try {
            if ($search) {
                $users = User::search($search, $limit);
                $total = count($users); // Approximate
            } else {
                $users = User::getAll($limit, $offset);
                $total = User::count();
            }
            
            // Remove sensitive data
            foreach ($users as &$user) {
                unset($user['password'], $user['emailOTP'], $user['passwordResetToken']);
            }
            
            Response::json([
                'users' => $users,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'totalPages' => ceil($total / $limit)
                ]
            ]);
            
        } catch (Exception $e) {
            error_log('Admin get users error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Get all ads (admin only)
    public function getAds() {
        $admin = AuthMiddleware::requireAdmin();
        
        $page = intval($_GET['page'] ?? 1);
        $limit = intval($_GET['limit'] ?? 50);
        $status = $_GET['status'] ?? '';
        $search = $_GET['search'] ?? '';
        $offset = ($page - 1) * $limit;
        
        try {
            $filters = [];
            if ($status) $filters['status'] = $status;
            if ($search) $filters['search'] = $search;
            
            // For admin, we want to see all ads regardless of status
            $ads = Ad::getAll($limit, $offset, $filters);
            $total = Ad::count($filters);
            
            Response::json([
                'ads' => $ads,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'totalPages' => ceil($total / $limit)
                ]
            ]);
            
        } catch (Exception $e) {
            error_log('Admin get ads error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Ban user
    public function banUser($userId) {
        $admin = AuthMiddleware::requireAdmin();
        
        $input = json_decode(file_get_contents('php://input'), true);
        $reason = trim($input['reason'] ?? '');
        
        try {
            $user = User::findById($userId);
            
            if (!$user) {
                Response::error('User not found', 404);
            }
            
            if ($user['isAdmin']) {
                Response::error('Cannot ban admin users', 400);
            }
            
            if ($user['isBanned']) {
                Response::error('User is already banned', 400);
            }
            
            User::update($userId, [
                'isBanned' => true,
                'banReason' => $reason,
                'bannedAt' => date('Y-m-d H:i:s'),
                'bannedBy' => $admin['id']
            ]);
            
            Response::json(['message' => 'User banned successfully']);
            
        } catch (Exception $e) {
            error_log('Ban user error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Unban user
    public function unbanUser($userId) {
        $admin = AuthMiddleware::requireAdmin();
        
        try {
            $user = User::findById($userId);
            
            if (!$user) {
                Response::error('User not found', 404);
            }
            
            if (!$user['isBanned']) {
                Response::error('User is not banned', 400);
            }
            
            User::update($userId, [
                'isBanned' => false,
                'banReason' => null,
                'bannedAt' => null,
                'bannedBy' => null,
                'unbannedAt' => date('Y-m-d H:i:s'),
                'unbannedBy' => $admin['id']
            ]);
            
            Response::json(['message' => 'User unbanned successfully']);
            
        } catch (Exception $e) {
            error_log('Unban user error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Delete ad (admin)
    public function deleteAd($adId) {
        $admin = AuthMiddleware::requireAdmin();
        
        try {
            $ad = Ad::findById($adId);
            
            if (!$ad) {
                Response::error('Ad not found', 404);
            }
            
            Ad::delete($adId);
            
            Response::json(['message' => 'Ad deleted successfully']);
            
        } catch (Exception $e) {
            error_log('Admin delete ad error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Approve ad
    public function approveAd($adId) {
        $admin = AuthMiddleware::requireAdmin();
        
        try {
            $ad = Ad::findById($adId);
            
            if (!$ad) {
                Response::error('Ad not found', 404);
            }
            
            Ad::update($adId, [
                'status' => 'active',
                'approvedAt' => date('Y-m-d H:i:s'),
                'approvedBy' => $admin['id']
            ]);
            
            Response::json(['message' => 'Ad approved successfully']);
            
        } catch (Exception $e) {
            error_log('Approve ad error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Reject ad
    public function rejectAd($adId) {
        $admin = AuthMiddleware::requireAdmin();
        
        $input = json_decode(file_get_contents('php://input'), true);
        $reason = trim($input['reason'] ?? '');
        
        try {
            $ad = Ad::findById($adId);
            
            if (!$ad) {
                Response::error('Ad not found', 404);
            }
            
            Ad::update($adId, [
                'status' => 'rejected',
                'rejectionReason' => $reason,
                'rejectedAt' => date('Y-m-d H:i:s'),
                'rejectedBy' => $admin['id']
            ]);
            
            Response::json(['message' => 'Ad rejected successfully']);
            
        } catch (Exception $e) {
            error_log('Reject ad error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Get admin dashboard stats
    public function getDashboardStats() {
        $admin = AuthMiddleware::requireAdmin();
        
        try {
            $pdo = Database::getConnection();
            
            // Get user stats
            $userStats = $pdo->query("
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN isEmailVerified = 1 THEN 1 ELSE 0 END) as verified,
                    SUM(CASE WHEN isBanned = 1 THEN 1 ELSE 0 END) as banned,
                    SUM(CASE WHEN DATE(createdAt) = CURDATE() THEN 1 ELSE 0 END) as today
                FROM users
            ")->fetch();
            
            // Get ad stats
            $adStats = $pdo->query("
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold,
                    SUM(CASE WHEN DATE(createdAt) = CURDATE() THEN 1 ELSE 0 END) as today
                FROM ads
            ")->fetch();
            
            // Get chat stats
            $chatStats = $pdo->query("
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN DATE(createdAt) = CURDATE() THEN 1 ELSE 0 END) as today
                FROM chats
            ")->fetch();
            
            Response::json([
                'users' => $userStats,
                'ads' => $adStats,
                'chats' => $chatStats
            ]);
            
        } catch (Exception $e) {
            error_log('Dashboard stats error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Get admin email from .env file (public endpoint)
    public function getAdminEmail() {
        try {
            // Load environment variables
            $envFile = __DIR__ . '/../.env';
            $adminEmail = null;
            $adminUsername = null;
            
            if (file_exists($envFile)) {
                $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                foreach ($lines as $line) {
                    $line = trim($line);
                    if (strpos($line, 'admin_email') === 0) {
                        $parts = explode('=', $line, 2);
                        if (count($parts) === 2) {
                            $adminEmail = trim(trim($parts[1]), ' "\'');
                        }
                    }
                    if (strpos($line, 'admin_username') === 0) {
                        $parts = explode('=', $line, 2);
                        if (count($parts) === 2) {
                            $adminUsername = trim(trim($parts[1]), ' "\'');
                        }
                    }
                }
            }
            
            Response::success([
                'adminEmail' => $adminEmail,
                'adminUsername' => $adminUsername
            ]);
            
        } catch (Exception $e) {
            error_log('Get admin email error: ' . $e->getMessage());
            Response::error('Server error', 500);
        }
    }
}
?>
