<?php
/**
 * Hybrid Router - Combines index.php and server.php routing
 * This router can intelligently choose between different routing strategies
 */

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

// Load routing configuration
$ROUTING_CONFIG = require_once __DIR__ . '/config/router.php';

// Load common dependencies
require_once __DIR__ . '/config/env.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/utils/jwt.php';
require_once __DIR__ . '/utils/Validation.php';
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

// Also load complete controllers for server.php style
if (file_exists(__DIR__ . '/controllers/AdController-complete.php')) {
    require_once __DIR__ . '/controllers/AdController-complete.php';
}
if (file_exists(__DIR__ . '/controllers/ChatController-complete.php')) {
    require_once __DIR__ . '/controllers/ChatController-complete.php';
}
if (file_exists(__DIR__ . '/controllers/AdminController-complete.php')) {
    require_once __DIR__ . '/controllers/AdminController-complete.php';
}

// Error reporting for debugging (disable in production)
if (getenv('PHP_ENV') !== 'production') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

// Parse the request
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Remove base path if needed
$path = str_replace('/api', '', $path);

// Debug logging
error_log("HYBRID ROUTER: Received request: $method $request_uri");
error_log("HYBRID ROUTER: Parsed path: $path");

// Determine routing strategy
function getRoutingStrategy($path) {
    global $ROUTING_CONFIG;
    
    // Check for route aliases first
    if (isset($ROUTING_CONFIG['aliases'][$path])) {
        $path = $ROUTING_CONFIG['aliases'][$path];
        error_log("HYBRID ROUTER: Route alias applied, using $path");
    }
    
    // Check for specific route overrides
    foreach ($ROUTING_CONFIG['route_overrides'] as $route_pattern => $strategy) {
        if (strpos($path, $route_pattern) === 0) {
            error_log("HYBRID ROUTER: Using $strategy strategy for $path (matched $route_pattern)");
            return $strategy;
        }
    }
    
    // Use default strategy
    $default = $ROUTING_CONFIG['default_strategy'];
    error_log("HYBRID ROUTER: Using $default strategy for $path (default)");
    return $default;
}

// Main routing logic
try {
    $strategy = getRoutingStrategy($path);
    
    // Route based on strategy
    if ($strategy === 'server') {
        handleServerStyleRouting($path, $method);
    } else {
        handleIndexStyleRouting($path, $method);
    }
} catch (Exception $e) {
    error_log('HYBRID ROUTER Error: ' . $e->getMessage());
    Response::error('Internal server error: ' . $e->getMessage(), 500);
}

/**
 * Handle routing using index.php style (more flexible, includes many route types)
 */
function handleIndexStyleRouting($path, $method) {
    error_log("HYBRID ROUTER: Using index.php style routing for $path");
    
    // Authentication routes
    if (strpos($path, '/auth/') === 0) {
        $authController = new AuthController();
        handleIndexAuthRoutes($authController, $path, $method);
    }
    // User routes
    elseif (strpos($path, '/user') === 0) {
        $userController = new UserController();
        handleIndexUserRoutes($userController, $path, $method);
    }
    // Ad routes
    elseif (strpos($path, '/ads') === 0) {
        $adController = new AdController();
        handleIndexAdRoutes($adController, $path, $method);
    }
    // Chat routes
    elseif (strpos($path, '/chat') === 0) {
        $chatController = new ChatController();
        handleIndexChatRoutes($chatController, $path, $method);
    }
    // Deals routes
    elseif (strpos($path, '/deals') === 0) {
        handleDealsRoutes($path, $method);
    }
    // Crypto payments routes
    elseif (strpos($path, '/crypto-payments') === 0) {
        handleCryptoPaymentsRoutes($path, $method);
    }
    // Webhook routes
    elseif (strpos($path, '/webhooks/nowpayments') === 0) {
        require_once __DIR__ . '/webhooks/nowpayments.php';
        exit();
    }
    // Admin routes
    elseif (strpos($path, '/admin') === 0) {
        $adminController = new AdminController();
        handleIndexAdminRoutes($adminController, $path, $method);
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
    // Health check
    elseif ($path === '/health') {
        Response::success(['status' => 'ok', 'router' => 'hybrid-index']);
    }
    // Auth debug route
    elseif ($path === '/auth-debug') {
        try {
            $user = AuthMiddleware::authenticate();
            Response::json([
                'message' => 'User authenticated successfully',
                'user' => $user,
                'router' => 'hybrid-index',
                'isAdmin' => $user['isAdmin'] ?? null
            ]);
        } catch (Exception $e) {
            Response::error('Debug failed: ' . $e->getMessage(), 500);
        }
    }
    else {
        Response::error('Route not found', 404);
    }
}

/**
 * Handle routing using server.php style (more structured, controller-focused)
 */
function handleServerStyleRouting($path, $method) {
    error_log("HYBRID ROUTER: Using server.php style routing for $path");
    
    // Authentication routes
    if (strpos($path, '/auth/') === 0) {
        $authController = new AuthController();
        handleServerAuthRoutes($authController, $path, $method);
    }
    // User routes
    elseif (strpos($path, '/user') === 0) {
        $userController = new UserController();
        handleServerUserRoutes($userController, $path, $method);
    }
    // Ad routes
    elseif (strpos($path, '/ads') === 0) {
        // Use complete controller if available
        if (class_exists('AdController') && method_exists('AdController', 'getAllAds')) {
            $adController = new AdController();
        } else {
            $adController = new AdController();
        }
        handleServerAdRoutes($adController, $path, $method);
    }
    // Chat routes
    elseif (strpos($path, '/chat') === 0) {
        $chatController = new ChatController();
        handleServerChatRoutes($chatController, $path, $method);
    }
    // Admin routes
    elseif (strpos($path, '/admin') === 0) {
        $adminController = new AdminController();
        handleServerAdminRoutes($adminController, $path, $method);
    }
    // Health check
    elseif ($path === '/health' || $path === '/' || $path === '') {
        http_response_code(200);
        echo json_encode([
            'status' => 'ok',
            'router' => 'hybrid-server',
            'message' => 'PHP Backend API is running with hybrid routing',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
    else {
        http_response_code(404);
        echo json_encode(['message' => 'Route not found: ' . $path, 'router' => 'hybrid-server']);
    }
}

// INDEX.PHP STYLE ROUTE HANDLERS
function handleIndexAuthRoutes($controller, $path, $method) {
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

function handleIndexUserRoutes($controller, $path, $method) {
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

function handleIndexAdRoutes($controller, $path, $method) {
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
        case $path === '/ads/my-ads' && $method === 'GET':
        case $path === '/ads/user/my-ads' && $method === 'GET':
            $controller->getMyAds();
            break;
        case $path === '/ads/search' && $method === 'GET':
            $controller->searchAds();
            break;
        case $path === '/ads/upload/screenshots' && $method === 'POST':
            $uploadController = new AdUploadController();
            $uploadController->uploadScreenshots();
            break;
        case $path === '/ads/upload/thumbnail' && $method === 'POST':
            $uploadController = new AdUploadController();
            $uploadController->uploadThumbnail();
            break;
        default:
            Response::error('Ad route not found', 404);
    }
}

function handleIndexChatRoutes($controller, $path, $method) {
    switch (true) {
        case $path === '/chat' && $method === 'GET':
        case $path === '/chat/chats' && $method === 'GET':
            $controller->getUserChats();
            break;
        case $path === '/chat' && $method === 'POST':
        case $path === '/chat/chats' && $method === 'POST':
            $controller->createOrGetChat();
            break;
        case preg_match('/^\/chat\/(\d+)\/messages$/', $path, $matches) && $method === 'GET':
        case preg_match('/^\/chat\/chats\/(\d+)\/messages$/', $path, $matches) && $method === 'GET':
            $controller->getChatMessages($matches[1]);
            break;
        case preg_match('/^\/chat\/(\d+)\/messages$/', $path, $matches) && $method === 'POST':
        case preg_match('/^\/chat\/chats\/(\d+)\/messages$/', $path, $matches) && $method === 'POST':
            $controller->sendMessage($matches[1]);
            break;
        case $path === '/chat/ad-inquiry' && $method === 'POST':
            $controller->createAdInquiryChat();
            break;
        default:
            Response::error('Chat route not found', 404);
    }
}

function handleIndexAdminRoutes($controller, $path, $method) {
    switch (true) {
        case $path === '/admin/dashboard-stats' && $method === 'GET':
            $controller->getDashboardStats();
            break;
        case $path === '/admin/users' && $method === 'GET':
            $controller->getUsers();
            break;
        case $path === '/admin/ads' && $method === 'GET':
            $controller->getAds();
            break;
        default:
            Response::error('Admin route not found', 404);
    }
}

// SERVER.PHP STYLE ROUTE HANDLERS
function handleServerAuthRoutes($controller, $path, $method) {
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
        case '/auth/google-signin':
            if ($method === 'POST') $controller->googleSignIn();
            else methodNotAllowed();
            break;
        default:
            routeNotFound();
    }
}

function handleServerUserRoutes($controller, $path, $method) {
    switch ($path) {
        case '/user/profile':
            if ($method === 'GET') $controller->getProfile();
            elseif ($method === 'PUT') $controller->updateProfile();
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
        default:
            routeNotFound();
    }
}

function handleServerAdRoutes($controller, $path, $method) {
    if ($path === '/ads' || $path === '/ads/') {
        if ($method === 'GET') $controller->getAllAds();
        elseif ($method === 'POST') $controller->createAd();
        else methodNotAllowed();
    }
    elseif ($path === '/ads/search') {
        if ($method === 'GET') $controller->searchAds();
        else methodNotAllowed();
    }
    elseif (preg_match('/^\/ads\/(\d+)$/', $path, $matches)) {
        $adId = $matches[1];
        if ($method === 'GET') $controller->getAdById($adId);
        elseif ($method === 'PUT') $controller->updateAd($adId);
        elseif ($method === 'DELETE') $controller->deleteAd($adId);
        else methodNotAllowed();
    }
    else {
        routeNotFound();
    }
}

function handleServerChatRoutes($controller, $path, $method) {
    if ($path === '/chat/chats' || $path === '/chat/chats/') {
        if ($method === 'GET') $controller->getUserChats();
        elseif ($method === 'POST') $controller->createOrGetChat();
        else methodNotAllowed();
    }
    elseif (preg_match('/^\/chat\/chats\/(\d+)\/messages$/', $path, $matches)) {
        $chatId = $matches[1];
        if ($method === 'GET') $controller->getChatMessages($chatId);
        elseif ($method === 'POST') $controller->sendMessage($chatId);
        else methodNotAllowed();
    }
    else {
        routeNotFound();
    }
}

function handleServerAdminRoutes($controller, $path, $method) {
    if ($path === '/admin/users' || $path === '/admin/users/') {
        if ($method === 'GET') $controller->getAllUsers();
        else methodNotAllowed();
    }
    elseif ($path === '/admin/dashboard-stats') {
        if ($method === 'GET') $controller->getDashboardStats();
        else methodNotAllowed();
    }
    else {
        routeNotFound();
    }
}

// SHARED ROUTE HANDLERS (used by both styles)
function handleContactRoutes($path, $method) {
    require_once __DIR__ . '/controllers/ContactController.php';
    $controller = new ContactController();
    
    if ($path === '/contact/submit' && $method === 'POST') {
        $controller->submit();
    } elseif ($path === '/contact/status' && $method === 'GET') {
        $controller->status();
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

function handleCryptoPaymentsRoutes($path, $method) {
    require_once __DIR__ . '/api/crypto-payments.php';
}

// Helper functions
function methodNotAllowed() {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed', 'router' => 'hybrid']);
}

function routeNotFound() {
    http_response_code(404);
    echo json_encode(['message' => 'Route not found', 'router' => 'hybrid']);
}

?>
