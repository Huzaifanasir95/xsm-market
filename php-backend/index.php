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

// Load environment variables
require_once __DIR__ . '/config/env.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/cors.php';

// Load utilities
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/utils/jwt.php';
require_once __DIR__ . '/utils/Validation.php';

// Load middleware
require_once __DIR__ . '/middleware/auth.php';

// Load models
require_once __DIR__ . '/models/User.php';
require_once __DIR__ . '/models/Ad.php';
require_once __DIR__ . '/models/Chat.php';
require_once __DIR__ . '/models/Message.php';
require_once __DIR__ . '/models/ChatParticipant.php';

// Load controllers
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/UserController.php';
require_once __DIR__ . '/controllers/AdController.php';
require_once __DIR__ . '/controllers/ChatController.php';
require_once __DIR__ . '/controllers/ChatUploadController.php';
require_once __DIR__ . '/controllers/AdminController.php';

// Error reporting for debugging (disable in production)
if (getenv('PHP_ENV') !== 'production') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

// Parse the request
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Remove base path if needed (adjust for your hosting setup)
$path = str_replace('/api', '', $path);

// Route handling
try {
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
    // Deals routes
    elseif (strpos($path, '/deals') === 0) {
        handleDealsRoutes($path, $method);
    }
    // Admin routes
    elseif (strpos($path, '/admin') === 0) {
        $adminController = new AdminController();
        handleAdminRoutes($adminController, $path, $method);
    }
    // Health check
    elseif ($path === '/health') {
        Response::success(['status' => 'ok']);
    }
    // Contact routes
    elseif (strpos($path, '/contact') === 0) {
        handleContactRoutes($path, $method);
    }
    // Social media routes
    elseif (strpos($path, '/social-media') === 0) {
        handleSocialMediaRoutes($path, $method);
    }
    // Debug routes
    elseif (strpos($path, '/debug') === 0) {
        handleDebugRoutes($path, $method);
    }
    else {
        Response::error('Route not found', 404);
    }
} catch (Exception $e) {
    error_log('API Error: ' . $e->getMessage());
    Response::error('Internal server error: ' . $e->getMessage(), 500);
}

// Route handlers
function handleAuthRoutes($controller, $path, $method) {
    switch (true) {
        case $path === '/auth/register' && $method === 'POST':
            $controller->register();
            break;
        case $path === '/auth/verify-otp' && $method === 'POST':
            $controller->verifyOTP();
            break;
        case $path === '/auth/login' && $method === 'POST':
            $controller->login();
            break;
        case $path === '/auth/google' && $method === 'POST':
            $controller->googleSignIn();
            break;
        case $path === '/auth/google-signin' && $method === 'POST':
            $controller->googleSignIn();
            break;
        case $path === '/auth/refresh-token' && $method === 'POST':
            $controller->refreshToken();
            break;
        case $path === '/auth/logout' && $method === 'POST':
            $controller->logout();
            break;
        case $path === '/auth/forgot-password' && $method === 'POST':
            $controller->forgotPassword();
            break;
        case $path === '/auth/reset-password' && $method === 'POST':
            $controller->resetPassword();
            break;
        case $path === '/auth/change-password' && $method === 'POST':
            $controller->changePassword();
            break;
        case $path === '/auth/verify-reset-token' && $method === 'POST':
            $controller->verifyResetToken();
            break;
        default:
            Response::error('Auth route not found', 404);
    }
}

function handleUserRoutes($controller, $path, $method) {
    switch (true) {
        case $path === '/user/profile' && $method === 'GET':
            $controller->getProfile();
            break;
        case $path === '/user/profile' && $method === 'PUT':
            $controller->updateProfile();
            break;
        case $path === '/user/check-username' && $method === 'POST':
            $controller->checkUsername();
            break;
        case $path === '/user/password' && $method === 'PUT':
            $controller->changePassword();
            break;
        case preg_match('/^\/user\/(\d+)$/', $path, $matches) && $method === 'GET':
            $controller->getUserById($matches[1]);
            break;
        default:
            Response::error('User route not found', 404);
    }
}

function handleAdRoutes($controller, $path, $method) {
    switch (true) {
        case $path === '/ads' && $method === 'GET':
            $controller->getAllAds();
            break;
        case $path === '/ads' && $method === 'POST':
            $controller->createAd();
            break;
        case preg_match('/^\/ads\/(\d+)$/', $path, $matches) && $method === 'GET':
            $controller->getAdById($matches[1]);
            break;
        case preg_match('/^\/ads\/(\d+)$/', $path, $matches) && $method === 'PUT':
            $controller->updateAd($matches[1]);
            break;
        case preg_match('/^\/ads\/(\d+)$/', $path, $matches) && $method === 'DELETE':
            $controller->deleteAd($matches[1]);
            break;
        case preg_match('/^\/ads\/(\d+)\/mark-sold$/', $path, $matches) && $method === 'PUT':
            $controller->markAsSold($matches[1]);
            break;
        case $path === '/ads/my-ads' && $method === 'GET':
            $controller->getMyAds();
            break;
        case $path === '/ads/user/my-ads' && $method === 'GET':
            $controller->getMyAds();
            break;
        case $path === '/ads/search' && $method === 'GET':
            $controller->searchAds();
            break;
        default:
            Response::error('Ad route not found', 404);
    }
}

function handleChatRoutes($controller, $path, $method) {
    switch (true) {
        case $path === '/chat' && $method === 'GET':
            $controller->getUserChats();
            break;
        case $path === '/chat/chats' && $method === 'GET':
            $controller->getUserChats();
            break;
        case $path === '/chat' && $method === 'POST':
            $controller->createOrGetChat();
            break;
        case $path === '/chat/chats' && $method === 'POST':
            $controller->createOrGetChat();
            break;
        case preg_match('/^\/chat\/(\d+)\/messages$/', $path, $matches) && $method === 'GET':
            $controller->getChatMessages($matches[1]);
            break;
        case preg_match('/^\/chat\/chats\/(\d+)\/messages$/', $path, $matches) && $method === 'GET':
            $controller->getChatMessages($matches[1]);
            break;
        case preg_match('/^\/chat\/(\d+)\/messages$/', $path, $matches) && $method === 'POST':
            $controller->sendMessage($matches[1]);
            break;
        case preg_match('/^\/chat\/chats\/(\d+)\/messages$/', $path, $matches) && $method === 'POST':
            $controller->sendMessage($matches[1]);
            break;
        case preg_match('/^\/chat\/(\d+)\/read$/', $path, $matches) && $method === 'PUT':
            $controller->markMessagesAsRead($matches[1]);
            break;
        case preg_match('/^\/chat\/chats\/(\d+)\/read$/', $path, $matches) && $method === 'PUT':
            $controller->markMessagesAsRead($matches[1]);
            break;
        case preg_match('/^\/chat\/(\d+)\/upload$/', $path, $matches) && $method === 'POST':
            $_GET['chatId'] = $matches[1];
            $uploadController = new ChatUploadController();
            $uploadController->uploadFile();
            break;
        case preg_match('/^\/chat\/chats\/(\d+)\/upload$/', $path, $matches) && $method === 'POST':
            $_GET['chatId'] = $matches[1];
            $uploadController = new ChatUploadController();
            $uploadController->uploadFile();
            break;
        case $path === '/chat/ad-inquiry' && $method === 'POST':
            $controller->createAdInquiryChat();
            break;
        default:
            Response::error('Chat route not found', 404);
    }
}

function handleAdminRoutes($controller, $path, $method) {
    switch (true) {
        case $path === '/admin/users' && $method === 'GET':
            $controller->getUsers();
            break;
        case $path === '/admin/ads' && $method === 'GET':
            $controller->getAds();
            break;
        case preg_match('/^\/admin\/users\/(\d+)\/ban$/', $path, $matches) && $method === 'PUT':
            $controller->banUser($matches[1]);
            break;
        case preg_match('/^\/admin\/users\/(\d+)\/unban$/', $path, $matches) && $method === 'PUT':
            $controller->unbanUser($matches[1]);
            break;
        case preg_match('/^\/admin\/ads\/(\d+)\/delete$/', $path, $matches) && $method === 'DELETE':
            $controller->deleteAd($matches[1]);
            break;
        default:
            Response::error('Admin route not found', 404);
    }
}

function handleContactRoutes($path, $method) {
    require_once __DIR__ . '/controllers/ContactController.php';
    $controller = new ContactController();
    
    if ($path === '/contact/submit' && $method === 'POST') {
        $controller->submit();
    } elseif ($path === '/contact/status' && $method === 'GET') {
        $controller->status();
    } elseif ($path === '/contact' && $method === 'POST') {
        // Legacy support - redirect to /contact/submit
        $controller->submit();
    } else {
        Response::error('Contact route not found', 404);
    }
}

function handleSocialMediaRoutes($path, $method) {
    require_once __DIR__ . '/routes/social-media.php';
}

function handleDebugRoutes($path, $method) {
    require_once __DIR__ . '/routes/debug.php';
}

function handleDealsRoutes($path, $method) {
    require_once __DIR__ . '/routes/deals.php';
}
?>
