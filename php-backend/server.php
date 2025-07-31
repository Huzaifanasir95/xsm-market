<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load environment variables and configurations
require_once __DIR__ . '/config/database.php';

// Load utilities and middleware
require_once __DIR__ . '/utils/jwt.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';

// Load controllers
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/UserController.php';
require_once __DIR__ . '/controllers/AdController-complete.php';
require_once __DIR__ . '/controllers/AdUploadController.php';
require_once __DIR__ . '/controllers/ChatController-complete.php';
require_once __DIR__ . '/controllers/ChatUploadController.php';
require_once __DIR__ . '/controllers/AdminController-complete.php';

// Error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// Parse the request
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Remove base path if needed (adjust for your hosting setup)
$path = str_replace('/api', '', $path);

// Route handling
try {
    // Static file serving for uploads
    if (strpos($path, '/uploads/') === 0) {
        include __DIR__ . '/serve-file.php';
        exit();
    }
    
    // Authentication routes
    if (strpos($path, '/auth/') === 0) {
        $authController = new AuthController();
        handleAuthRoutes($authController, $path, $method);
    }
    // User routes
    elseif (strpos($path, '/user') === 0) {
        $userController = new UserController();
        handleUserRoutes($userController, $path, $method);
    }
    // Ad routes
    elseif (strpos($path, '/ads') === 0) {
        $adController = new AdController();
        handleAdRoutes($adController, $path, $method);
    }
    // Chat routes
    elseif (strpos($path, '/chat') === 0) {
        $chatController = new ChatController();
        handleChatRoutes($chatController, $path, $method);
    }
    // File serving routes
    elseif (strpos($path, '/files/') === 0) {
        handleFileServing($path);
    }
    // Deals routes
    elseif (strpos($path, '/deals') === 0) {
        handleDealsRoutes($path, $method);
    }
    // Admin routes
    elseif (strpos($path, '/admin') === 0) {
        $adminController = new AdminController();
        handleAdminRoutes($adminController, $path, $method);
    }
    // Serve uploaded files
    elseif (strpos($path, '/uploads/') === 0) {
        $filePath = __DIR__ . $path;
        if (file_exists($filePath) && is_file($filePath)) {
            $mimeType = mime_content_type($filePath);
            header('Content-Type: ' . $mimeType);
            header('Content-Length: ' . filesize($filePath));
            readfile($filePath);
            exit;
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'File not found']);
        }
    }
    // Health check
    elseif ($path === '/health' || $path === '/' || $path === '') {
        http_response_code(200);
        echo json_encode([
            'status' => 'ok', 
            'message' => 'PHP Backend API is running on port 5000',
            'timestamp' => date('Y-m-d H:i:s'),
            'endpoints' => [
                'auth' => '/auth/*',
                'users' => '/user/*',
                'ads' => '/ads/*',
                'chat' => '/chat/*',
                'deals' => '/deals/*',
                'admin' => '/admin/*'
            ]
        ]);
    }
    else {
        http_response_code(404);
        echo json_encode(['message' => 'Route not found: ' . $path]);
    }
} catch (Exception $e) {
    error_log('API Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Server error', 'error' => $e->getMessage()]);
}

// Authentication route handler
function handleAuthRoutes($controller, $path, $method) {
    switch ($path) {
        case '/auth/register':
            if ($method === 'POST') $controller->register();
            else methodNotAllowed();
            break;
        case '/auth/login':
            if ($method === 'POST') $controller->login();
            else methodNotAllowed();
            break;
        case '/auth/verify-otp':
            if ($method === 'POST') $controller->verifyOTP();
            else methodNotAllowed();
            break;
        case '/auth/resend-otp':
            if ($method === 'POST') $controller->resendOTP();
            else methodNotAllowed();
            break;
        case '/auth/google-signin':
            if ($method === 'POST') $controller->googleSignIn();
            else methodNotAllowed();
            break;
        case '/auth/forgot-password':
            if ($method === 'POST') $controller->forgotPassword();
            else methodNotAllowed();
            break;
        case '/auth/reset-password':
            if ($method === 'POST') $controller->resetPassword();
            else methodNotAllowed();
            break;
        case '/auth/verify-token':
            if ($method === 'POST') $controller->verifyToken();
            else methodNotAllowed();
            break;
        case '/auth/refresh':
            if ($method === 'POST') $controller->refreshToken();
            else methodNotAllowed();
            break;
        default:
            routeNotFound();
    }
}

// User route handler
function handleUserRoutes($controller, $path, $method) {
    switch ($path) {
        case '/user/test':
            if ($method === 'GET') {
                http_response_code(200);
                echo json_encode(['message' => 'User routes working!']);
            } else methodNotAllowed();
            break;
        case '/user/profile':
            if ($method === 'GET') $controller->getProfile();
            elseif ($method === 'PUT') $controller->updateProfile();
            else methodNotAllowed();
            break;
        case '/user/username':
            if ($method === 'PUT') $controller->updateUsername();
            else methodNotAllowed();
            break;
        case '/user/profile-picture':
            if ($method === 'PUT') $controller->updateProfilePicture();
            else methodNotAllowed();
            break;
        case '/user/check-username':
            if ($method === 'GET') $controller->checkUsernameAvailability();
            else methodNotAllowed();
            break;
        case '/user/password':
            if ($method === 'PUT') $controller->changePassword();
            else methodNotAllowed();
            break;
        case '/user/profile-legacy':
            if ($method === 'GET') $controller->getProfile();
            else methodNotAllowed();
            break;
        default:
            routeNotFound();
    }
}

// Ad route handler
function handleAdRoutes($controller, $path, $method) {
    if ($path === '/ads' || $path === '/ads/') {
        if ($method === 'GET') $controller->getAllAds();
        elseif ($method === 'POST') $controller->createAd();
        else methodNotAllowed();
    }
    elseif ($path === '/ads/search') {
        if ($method === 'GET') $controller->searchAds();
        else methodNotAllowed();
    }
    elseif ($path === '/ads/user') {
        if ($method === 'GET') $controller->getMyAds();
        else methodNotAllowed();
    }
    elseif (preg_match('/^\/ads\/(\d+)$/', $path, $matches)) {
        $adId = $matches[1];
        if ($method === 'GET') $controller->getAdById($adId);
        elseif ($method === 'PUT') $controller->updateAd($adId);
        elseif ($method === 'DELETE') $controller->deleteAd($adId);
        else methodNotAllowed();
    }
    elseif (preg_match('/^\/ads\/(\d+)\/contact$/', $path, $matches)) {
        $adId = $matches[1];
        if ($method === 'POST') $controller->contactSeller($adId);
        else methodNotAllowed();
    }
    elseif ($path === '/ads/upload/screenshots' && $method === 'POST') {
        $uploadController = new AdUploadController();
        $uploadController->uploadScreenshots();
    }
    elseif ($path === '/ads/upload/thumbnail' && $method === 'POST') {
        $uploadController = new AdUploadController();
        $uploadController->uploadThumbnail();
    }
    elseif ($path === '/ads/upload/test' && $method === 'GET') {
        http_response_code(200);
        echo json_encode(['message' => 'Upload route working', 'timestamp' => date('Y-m-d H:i:s')]);
    }
    else {
        routeNotFound();
    }
}

// Chat route handler
function handleChatRoutes($controller, $path, $method) {
    if ($path === '/chat/chats' || $path === '/chat/chats/') {
        if ($method === 'GET') $controller->getUserChats();
        elseif ($method === 'POST') $controller->createOrGetChat();
        else methodNotAllowed();
    }
    elseif ($path === '/chat/ad-inquiry') {
        if ($method === 'POST') $controller->createAdInquiryChat();
        else methodNotAllowed();
    }
    elseif ($path === '/chat/check-existing') {
        if ($method === 'POST') {
            $controller->checkExistingChat();
        } else methodNotAllowed();
    }
    elseif (preg_match('/^\/chat\/chats\/(\d+)\/messages$/', $path, $matches)) {
        $chatId = $matches[1];
        if ($method === 'GET') $controller->getChatMessages($chatId);
        elseif ($method === 'POST') $controller->sendMessage($chatId);
        else methodNotAllowed();
    }
    elseif (preg_match('/^\/chat\/chats\/(\d+)\/read$/', $path, $matches)) {
        $chatId = $matches[1];
        if ($method === 'PUT') $controller->markMessagesAsRead($chatId);
        else methodNotAllowed();
    }
    elseif (preg_match('/^\/chat\/admin\/chats\/(\d+)\/messages$/', $path, $matches)) {
        $chatId = $matches[1];
        if ($method === 'POST') $controller->adminSendMessage($chatId);
        else methodNotAllowed();
    }
    elseif ($path === '/chat/admin/find-deal-chat') {
        if ($method === 'POST') $controller->adminFindDealChat();
        else methodNotAllowed();
    }
    elseif (preg_match('/^\/chat\/admin\/messages\/(\d+)$/', $path, $matches)) {
        $messageId = $matches[1];
        if ($method === 'DELETE') $controller->adminDeleteMessage($messageId);
        else methodNotAllowed();
    }
    elseif (preg_match('/^\/chat\/admin\/chats\/(\d+)$/', $path, $matches)) {
        $chatId = $matches[1];
        if ($method === 'DELETE') $controller->adminDeleteChat($chatId);
        else methodNotAllowed();
    }
    else {
        routeNotFound();
    }
}

// Admin route handler
function handleAdminRoutes($controller, $path, $method) {
    if ($path === '/admin/email') {
        if ($method === 'GET') $controller->getAdminEmail();
        else methodNotAllowed();
    }
    elseif ($path === '/admin/deals') {
        if ($method === 'GET') $controller->getAllDeals();
        else methodNotAllowed();
    }
    elseif ($path === '/admin/users' || $path === '/admin/users/') {
        if ($method === 'GET') $controller->getAllUsers();
        else methodNotAllowed();
    }
    elseif (preg_match('/^\/admin\/users\/(\d+)$/', $path, $matches)) {
        $userId = $matches[1];
        if ($method === 'GET') $controller->getUserById($userId);
        elseif ($method === 'DELETE') $controller->deleteUser($userId);
        else methodNotAllowed();
    }
    elseif (preg_match('/^\/admin\/users\/(\d+)\/status$/', $path, $matches)) {
        $userId = $matches[1];
        if ($method === 'PUT') $controller->updateUserStatus($userId);
        else methodNotAllowed();
    }
    elseif ($path === '/admin/chats') {
        if ($method === 'GET') $controller->getAllChats();
        else methodNotAllowed();
    }
    elseif ($path === '/admin/dashboard-stats') {
        if ($method === 'GET') $controller->getDashboardStats();
        else methodNotAllowed();
    }
    elseif ($path === '/admin/recent-activities') {
        if ($method === 'GET') $controller->getRecentActivities();
        else methodNotAllowed();
    }
    elseif (preg_match('/^\/admin\/deals\/(\d+)\/confirm-primary-owner$/', $path, $matches)) {
        $dealId = $matches[1];
        if ($method === 'POST') $controller->confirmPrimaryOwnerMade($dealId);
        else methodNotAllowed();
    }
    elseif (preg_match('/^\/admin\/ads\/(\d+)$/', $path, $matches)) {
        $adId = $matches[1];
        if ($method === 'DELETE') $controller->deleteAd($adId);
        else methodNotAllowed();
    }
    else {
        routeNotFound();
    }
}

// Helper functions
function methodNotAllowed() {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
}

function routeNotFound() {
    http_response_code(404);
    echo json_encode(['message' => 'Route not found']);
}

function handleDealsRoutes($path, $method) {
    // Make path and method available globally for the deals route
    $GLOBALS['path'] = $path;
    $GLOBALS['method'] = $method;
    require_once __DIR__ . '/routes/deals.php';
}

// File serving handler
function handleFileServing($path) {
    // Extract file path from URL like /files/uploads/chat/filename.mp4
    $filePath = substr($path, 7); // Remove '/files/' prefix
    $fullPath = __DIR__ . '/' . $filePath;
    
    // Security check - ensure the file is within allowed directories
    $realPath = realpath($fullPath);
    $allowedDir = realpath(__DIR__ . '/uploads/');
    
    if ($realPath && $allowedDir && strpos($realPath, $allowedDir) === 0 && file_exists($realPath)) {
        // Get file info
        $fileInfo = pathinfo($realPath);
        $extension = strtolower($fileInfo['extension'] ?? '');
        
        // Set appropriate content type
        $contentTypes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'mp4' => 'video/mp4',
            'webm' => 'video/webm',
            'avi' => 'video/x-msvideo',
            'mov' => 'video/quicktime',
            'wmv' => 'video/x-ms-wmv'
        ];
        
        $contentType = $contentTypes[$extension] ?? 'application/octet-stream';
        
        // Set headers for file serving
        header('Content-Type: ' . $contentType);
        header('Content-Length: ' . filesize($realPath));
        header('Accept-Ranges: bytes');
        header('Access-Control-Allow-Origin: *');
        
        // Handle range requests for video streaming
        if (isset($_SERVER['HTTP_RANGE']) && strpos($contentType, 'video/') === 0) {
            $fileSize = filesize($realPath);
            $range = $_SERVER['HTTP_RANGE'];
            
            if (preg_match('/bytes=(\d+)-(\d*)/', $range, $matches)) {
                $start = intval($matches[1]);
                $end = $matches[2] ? intval($matches[2]) : $fileSize - 1;
                
                if ($start <= $end && $start < $fileSize) {
                    header('HTTP/1.1 206 Partial Content');
                    header("Content-Range: bytes $start-$end/$fileSize");
                    header('Content-Length: ' . ($end - $start + 1));
                    
                    $file = fopen($realPath, 'rb');
                    fseek($file, $start);
                    echo fread($file, $end - $start + 1);
                    fclose($file);
                    exit();
                }
            }
        }
        
        // Serve the entire file
        readfile($realPath);
        exit();
    } else {
        // File not found or access denied
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'File not found']);
        exit();
    }
}
?>
