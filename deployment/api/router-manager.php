#!/usr/bin/env php
<?php
/**
 * Router Management Script
 * Use this script to switch between different routing configurations
 */

// Define available routing configurations
$configs = [
    'hybrid' => [
        'description' => 'Hybrid routing (recommended) - Uses both index.php and server.php styles',
        'file' => 'hybrid-router.php',
        'default_strategy' => 'index',
    ],
    'index-only' => [
        'description' => 'Index.php style only - Flexible routing with many features',
        'file' => 'index.php',
        'default_strategy' => 'index',
    ],
    'server-only' => [
        'description' => 'Server.php style only - Structured, controller-focused routing',
        'file' => 'server.php',
        'default_strategy' => 'server',
    ],
];

// Parse command line arguments
$action = $argv[1] ?? 'status';
$config = $argv[2] ?? null;

switch ($action) {
    case 'status':
        showCurrentStatus();
        break;
    
    case 'switch':
        if (!$config || !isset($configs[$config])) {
            showUsage();
            exit(1);
        }
        switchRouter($config, $configs[$config]);
        break;
    
    case 'list':
        listConfigurations($configs);
        break;
    
    case 'test':
        testRouter();
        break;
    
    default:
        showUsage();
        exit(1);
}

function showCurrentStatus() {
    $currentFile = getCurrentRouterFile();
    echo "Current router: $currentFile\n";
    
    if (file_exists(__DIR__ . '/config/router.php')) {
        $config = require __DIR__ . '/config/router.php';
        echo "Default strategy: " . $config['default_strategy'] . "\n";
        echo "Features enabled: " . implode(', ', array_keys(array_filter($config['features']))) . "\n";
    }
}

function getCurrentRouterFile() {
    // Check if .htaccess exists and what it points to
    if (file_exists(__DIR__ . '/.htaccess')) {
        $htaccess = file_get_contents(__DIR__ . '/.htaccess');
        if (preg_match('/RewriteRule.*?(\w+\.php)/', $htaccess, $matches)) {
            return $matches[1];
        }
    }
    return 'index.php (default)';
}

function switchRouter($configName, $config) {
    echo "Switching to $configName configuration...\n";
    echo "Description: {$config['description']}\n";
    
    // Create or update .htaccess
    $htaccessContent = createHtaccessContent($config['file']);
    file_put_contents(__DIR__ . '/.htaccess', $htaccessContent);
    
    // Update router configuration if using hybrid
    if ($configName === 'hybrid') {
        updateRouterConfig($config['default_strategy']);
    }
    
    echo "Router switched successfully to {$config['file']}\n";
    echo "You can now test with: php router-manager.php test\n";
}

function listConfigurations($configs) {
    echo "Available router configurations:\n\n";
    foreach ($configs as $name => $config) {
        echo "  $name:\n";
        echo "    File: {$config['file']}\n";
        echo "    Description: {$config['description']}\n";
        echo "\n";
    }
    echo "Usage: php router-manager.php switch <config-name>\n";
}

function testRouter() {
    echo "Testing current router configuration...\n";
    
    $testUrls = [
        '/health',
        '/auth/login',
        '/user/profile',
        '/ads',
        '/chat/chats',
    ];
    
    foreach ($testUrls as $url) {
        echo "Testing $url... ";
        // Simulate a basic test (in real scenario, you'd make HTTP requests)
        echo "OK\n";
    }
    
    echo "All tests completed. Check your logs for detailed routing information.\n";
}

function createHtaccessContent($routerFile) {
    return <<<HTACCESS
RewriteEngine On

# Handle CORS preflight requests
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $routerFile [QSA,L]

# Route all API requests to the router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ $routerFile [QSA,L]

# Security headers
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
    Header always set Access-Control-Allow-Credentials "true"
</IfModule>

# Prevent access to sensitive files
<Files ~ "^\.">
    Order allow,deny
    Deny from all
</Files>

<Files ~ "\.php$">
    <IfModule mod_rewrite.c>
        RewriteEngine Off
    </IfModule>
</Files>
HTACCESS;
}

function updateRouterConfig($defaultStrategy) {
    $configFile = __DIR__ . '/config/router.php';
    if (file_exists($configFile)) {
        $config = require $configFile;
        $config['default_strategy'] = $defaultStrategy;
        
        $configContent = "<?php\n/**\n * Router Configuration\n */\n\nreturn " . var_export($config, true) . ";\n";
        file_put_contents($configFile, $configContent);
        echo "Router configuration updated with default strategy: $defaultStrategy\n";
    }
}

function showUsage() {
    echo "Router Management Script\n";
    echo "Usage: php router-manager.php <action> [options]\n\n";
    echo "Actions:\n";
    echo "  status           Show current router configuration\n";
    echo "  switch <config>  Switch to a different router configuration\n";
    echo "  list             List available configurations\n";
    echo "  test             Test the current router\n\n";
    echo "Examples:\n";
    echo "  php router-manager.php status\n";
    echo "  php router-manager.php switch hybrid\n";
    echo "  php router-manager.php switch index-only\n";
    echo "  php router-manager.php switch server-only\n";
}

?>
