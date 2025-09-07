<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/env.php';
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/utils/jwt.php';
require_once __DIR__ . '/models/User.php';
require_once __DIR__ . '/middleware/auth.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

try {
    $user = AuthMiddleware::authenticate();
    
    echo json_encode([
        'message' => 'User authenticated successfully',
        'user' => $user,
        'isAdmin' => $user['isAdmin'] ?? null,
        'isAdminType' => gettype($user['isAdmin'] ?? null),
        'adminEmail' => getenv('ADMIN_EMAIL'),
        'adminEmailCheck' => getenv('ADMIN_EMAIL') && strtolower($user['email']) === strtolower(getenv('ADMIN_EMAIL'))
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}
?>
