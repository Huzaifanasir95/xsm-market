# Hybrid PHP Router System

This hybrid routing system combines the flexibility of `index.php` style routing with the structure of `server.php` style routing, allowing you to use both approaches in a single application.

## Features

- **Flexible Route Configuration**: Choose between different routing strategies per route
- **Dynamic Strategy Selection**: Routes can use different styles based on patterns
- **Easy Management**: Command-line tools to switch between configurations
- **Backward Compatibility**: Works with existing `index.php` and `server.php` implementations
- **Configurable**: Easy to customize routing behavior via configuration files

## Quick Start

### 1. Switch to Hybrid Routing

```bash
cd php-backend
php router-manager.php switch hybrid
```

### 2. Check Current Status

```bash
php router-manager.php status
```

### 3. Test the Router

```bash
php router-manager.php test
```

## Available Configurations

### Hybrid (Recommended)
- **File**: `hybrid-router.php`
- **Description**: Uses both index.php and server.php styles intelligently
- **Best for**: Maximum flexibility while maintaining structure

### Index-only
- **File**: `index.php`
- **Description**: Uses only the index.php routing style
- **Best for**: Applications needing maximum routing flexibility

### Server-only
- **File**: `server.php`
- **Description**: Uses only the server.php routing style
- **Best for**: Applications preferring structured, controller-focused routing

## Configuration

Edit `config/router.php` to customize routing behavior:

```php
<?php
return [
    // Default routing strategy
    'default_strategy' => 'index', // or 'server'
    
    // Route-specific overrides
    'route_overrides' => [
        '/auth/' => 'server',        // Use server style for auth
        '/user' => 'server',         // Use server style for user routes
        '/crypto-payments' => 'index', // Use index style for crypto
        '/webhooks/' => 'index',     // Use index style for webhooks
    ],
    
    // Feature flags
    'features' => [
        'enable_logging' => true,
        'enable_cors' => true,
        'enable_auth_debug' => true,
    ],
];
```

## Routing Strategies

### Index.php Style
- **Characteristics**: Flexible, supports many route types, regex patterns
- **Best for**: Complex routing needs, legacy support, special features
- **Example routes**: 
  - `/crypto-payments/*`
  - `/webhooks/*`
  - `/social-media/*`
  - `/debug/*`

### Server.php Style
- **Characteristics**: Structured, controller-focused, clear separation
- **Best for**: Standard CRUD operations, clean API design
- **Example routes**:
  - `/auth/*`
  - `/user/*`
  - `/ads/*` (can be configured)
  - `/chat/*` (can be configured)

## Management Commands

```bash
# Show current configuration
php router-manager.php status

# List all available configurations
php router-manager.php list

# Switch to hybrid routing
php router-manager.php switch hybrid

# Switch to index-only routing
php router-manager.php switch index-only

# Switch to server-only routing
php router-manager.php switch server-only

# Test current configuration
php router-manager.php test
```

## Route Examples

### Authentication (Server Style)
```
POST /auth/login
POST /auth/register
POST /auth/google-signin
```

### User Management (Server Style)
```
GET /user/profile
PUT /user/profile
PUT /user/password
```

### Ads (Configurable - Default Index Style)
```
GET /ads
POST /ads
GET /ads/{id}
PUT /ads/{id}
DELETE /ads/{id}
GET /ads/my-ads
```

### Crypto Payments (Index Style)
```
POST /crypto-payments/create
GET /crypto-payments/status/{id}
POST /crypto-payments/webhook
```

## Benefits

1. **Gradual Migration**: Migrate routes one by one without breaking existing functionality
2. **Best of Both Worlds**: Use the most appropriate routing style for each feature
3. **Easy Testing**: Switch between configurations to test different approaches
4. **Maintainable**: Clear separation of concerns while keeping everything in one system
5. **Scalable**: Add new routing strategies as needed

## Debugging

Enable logging in the configuration to see which routing strategy is being used:

```php
'features' => [
    'enable_logging' => true,
],
```

Check your error logs to see messages like:
```
HYBRID ROUTER: Using server strategy for /auth/login (matched /auth/)
HYBRID ROUTER: Using index strategy for /crypto-payments/create (matched /crypto-payments)
```

## Advanced Usage

### Custom Route Aliases

Add route aliases in the configuration:

```php
'aliases' => [
    '/api/auth/google' => '/auth/google-signin',
    '/api/user/legacy' => '/user/profile',
],
```

### Middleware Configuration

Configure authentication requirements:

```php
'middleware' => [
    'auth_required' => [
        '/user/',
        '/ads/my-ads',
        '/chat/',
        '/admin/',
    ],
    'admin_required' => [
        '/admin/',
    ],
],
```

This hybrid system gives you the flexibility to use the best routing approach for each part of your application while maintaining a single, manageable entry point.
