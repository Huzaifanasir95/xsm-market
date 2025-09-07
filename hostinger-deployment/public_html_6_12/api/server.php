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
require_once __DIR__ . '/controllers/AdUploadController.php';
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
    // Test NOWPayments integration
    elseif ($path === '/test-nowpayments') {
        handleTestNOWPayments();
    }
    // Webhook routes
    elseif (strpos($path, '/webhooks/nowpayments') === 0) {
        include 'webhooks/nowpayments.php';
        exit;
    }
    // Crypto payments routes
    elseif (strpos($path, '/crypto-payments') === 0) {
        include 'api/crypto-payments.php';
        exit;
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
            Response::error('File not found', 404);
        }
    }
    // Health check
    elseif ($path === '/health' || $path === '/' || $path === '') {
        Response::success([
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
    Response::error('Internal server error: ' . $e->getMessage(), 500);
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
        case '/user/password/change-request':
            if ($method === 'POST') $controller->requestPasswordChange();
            else methodNotAllowed();
            break;
        case '/user/password/verify-change':
            if ($method === 'POST') $controller->verifyPasswordChange();
            else methodNotAllowed();
            break;
        case '/user/password/cooldown-status':
            if ($method === 'GET') $controller->getPasswordChangeCooldown();
            else methodNotAllowed();
            break;
        case '/user/email/change-request':
            if ($method === 'POST') $controller->requestEmailChange();
            else methodNotAllowed();
            break;
        case '/user/email/verify-current':
            if ($method === 'POST') $controller->verifyCurrentEmail();
            else methodNotAllowed();
            break;
        case '/user/email/verify-new':
            if ($method === 'POST') $controller->verifyNewEmail();
            else methodNotAllowed();
            break;
        case '/user/email/verify-change':
            if ($method === 'POST') $controller->verifyEmailChange();
            else methodNotAllowed();
            break;
        case '/user/email/cooldown-status':
            if ($method === 'GET') $controller->getEmailChangeCooldown();
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
    elseif ($path === '/ads/my-ads') {
        if ($method === 'GET') $controller->getMyAds();
        else methodNotAllowed();
    }
    elseif ($path === '/ads/user/my-ads') {
        if ($method === 'GET') $controller->getMyAds();
        else methodNotAllowed();
    }
    elseif ($path === '/ads/user') {
        if ($method === 'GET') $controller->getUserAds();
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
    elseif (preg_match('/^\/ads\/(\d+)\/pin$/', $path, $matches)) {
        $adId = $matches[1];
        if ($method === 'PUT') $controller->togglePin($adId);
        else methodNotAllowed();
    }
    elseif (preg_match('/^\/ads\/(\d+)\/pull-up$/', $path, $matches)) {
        $adId = $matches[1];
        if ($method === 'PUT') $controller->pullUpAd($adId);
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
    // Chat upload routes
    elseif (preg_match('/^\/chat\/chats\/(\d+)\/upload$/', $path, $matches)) {
        $chatId = $matches[1];
        if ($method === 'POST') {
            require_once __DIR__ . '/controllers/ChatUploadController.php';
            $_GET['chatId'] = $chatId;
            $uploadController = new ChatUploadController();
            $uploadController->uploadFile();
        } else methodNotAllowed();
    }
    elseif (preg_match('/^\/chat\/(\d+)\/upload$/', $path, $matches)) {
        $chatId = $matches[1];
        if ($method === 'POST') {
            require_once __DIR__ . '/controllers/ChatUploadController.php';
            $_GET['chatId'] = $chatId;
            $uploadController = new ChatUploadController();
            $uploadController->uploadFile();
        } else methodNotAllowed();
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
    elseif (preg_match('/^\/admin\/users\/(\d+)\/role$/', $path, $matches)) {
        $userId = $matches[1];
        if ($method === 'PUT') $controller->updateUserRole($userId);
        else methodNotAllowed();
    }
    elseif ($path === '/admin/chats') {
        if ($method === 'GET') $controller->getAllChats();
        else methodNotAllowed();
    }
    elseif ($path === '/admin/dashboard') {
        if ($method === 'GET') $controller->getDashboardStats();
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
    elseif (preg_match('/^\/admin\/ads\/(\d+)$/', $path, $matches)) {
        $adId = $matches[1];
        if ($method === 'DELETE') $controller->deleteAdAsAdmin($adId);
        else methodNotAllowed();
    }
    elseif (preg_match('/^\/admin\/deals\/(\d+)\/confirm-primary-owner$/', $path, $matches)) {
        $dealId = $matches[1];
        if ($method === 'POST') $controller->confirmPrimaryOwnerMade($dealId);
        else methodNotAllowed();
    }
    else {
        routeNotFound();
    }
}

// Helper functions
function methodNotAllowed() {
    Response::error('Method not allowed', 405);
}

function routeNotFound() {
    Response::error('Route not found', 404);
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
        http_response_code(404);
        echo json_encode(['message' => 'Contact route not found']);
    }
}

function handleSocialMediaRoutes($path, $method) {
    require_once __DIR__ . '/routes/social-media.php';
}

function handleDebugRoutes($path, $method) {
    require_once __DIR__ . '/routes/debug.php';
}

function handleCryptoPaymentsRoutes($path, $method) {
    require_once __DIR__ . '/api/crypto-payments.php';
}

function handleTestNOWPayments() {
    require_once __DIR__ . '/test_nowpayments_integration.php';
}
?>
