<?php
/**
 * Debug script to check current user session and admin status
 */

require_once __DIR__ . '/middleware/auth.php';
require_once __DIR__ . '/utils/Response.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

try {
    // Try to get current user via auth middleware
    $user = AuthMiddleware::optionalAuth();
    
    if (!$user) {
        Response::json([
            'authenticated' => false,
            'message' => 'No valid authentication found'
        ]);
        exit;
    }
    
    // Get admin email from environment
    $adminEmail = getenv('admin_user');
    
    // Check admin status
    $isAdminByFlag = !empty($user['isAdmin']);
    $isAdminByEmail = $adminEmail && strtolower($user['email']) === strtolower($adminEmail);
    
    Response::json([
        'authenticated' => true,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'authProvider' => $user['authProvider'],
            'isEmailVerified' => (bool)$user['isEmailVerified'],
            'isAdmin' => (bool)$user['isAdmin']
        ],
        'adminCheck' => [
            'isAdminByFlag' => $isAdminByFlag,
            'isAdminByEmail' => $isAdminByEmail,
            'adminEmailFromEnv' => $adminEmail ?: '[NOT SET]',
            'finalAdminStatus' => $isAdminByFlag || $isAdminByEmail
        ]
    ]);
    
} catch (Exception $e) {
    Response::error('Debug check failed: ' . $e->getMessage(), 500);
}
?>
