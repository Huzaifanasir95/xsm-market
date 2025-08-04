#!/bin/bash

# Update Hostinger Backend with Latest Changes
# This script copies all the fixed backend files to the hostinger deployment

echo "🚀 Updating Hostinger Backend Deployment..."

# Define paths
SOURCE_DIR="/Users/Apple/Documents/GitHub/xsm-market/php-backend"
TARGET_DIR="/Users/Apple/Documents/GitHub/xsm-market/hostinger-deployment/public_html/api"

# Backup existing deployment
echo "📦 Creating backup of existing deployment..."
cp -r "$TARGET_DIR" "$TARGET_DIR.backup.$(date +%Y%m%d_%H%M%S)"

# Copy key files that we've updated
echo "📁 Copying updated files..."

# 1. Server routing (with webhook and crypto-payments routes)
echo "   ✅ Copying server.php..."
cp "$SOURCE_DIR/server.php" "$TARGET_DIR/"

# 2. Webhook handler (with logging and fixed functionality)
echo "   ✅ Copying webhook handler..."
mkdir -p "$TARGET_DIR/webhooks"
cp "$SOURCE_DIR/webhooks/nowpayments.php" "$TARGET_DIR/webhooks/"

# 3. Crypto payments API (with fixed authentication)
echo "   ✅ Copying crypto payments API..."
mkdir -p "$TARGET_DIR/api"
cp "$SOURCE_DIR/api/crypto-payments.php" "$TARGET_DIR/api/"

# 4. Controllers (with fixed AuthMiddleware calls)
echo "   ✅ Copying controllers..."
cp "$SOURCE_DIR/controllers/ChatController-complete.php" "$TARGET_DIR/controllers/"
cp "$SOURCE_DIR/controllers/AdminController-complete.php" "$TARGET_DIR/controllers/"

# 5. Middleware (with working auth system)
echo "   ✅ Copying middleware..."
cp "$SOURCE_DIR/middleware/auth.php" "$TARGET_DIR/middleware/"

# 6. Copy any missing middleware files
if [ -f "$SOURCE_DIR/middleware/AuthMiddleware.php" ]; then
    cp "$SOURCE_DIR/middleware/AuthMiddleware.php" "$TARGET_DIR/middleware/"
fi

# 7. Utils and config (ensure all dependencies are available)
echo "   ✅ Copying utils and config..."
cp -r "$SOURCE_DIR/utils/"* "$TARGET_DIR/utils/" 2>/dev/null || true
cp -r "$SOURCE_DIR/config/"* "$TARGET_DIR/config/" 2>/dev/null || true

# 8. Routes
echo "   ✅ Copying routes..."
cp -r "$SOURCE_DIR/routes/"* "$TARGET_DIR/routes/" 2>/dev/null || true

echo "✅ Backend update completed!"
echo ""
echo "📋 Summary of changes deployed:"
echo "   • Fixed webhook routing for /webhooks/nowpayments"
echo "   • Fixed crypto-payments routing for /crypto-payments/*"
echo "   • Fixed AuthMiddleware authentication issues"
echo "   • Updated ChatController and AdminController"
echo "   • Added webhook logging and monitoring"
echo "   • Fixed 500 errors in crypto payment creation"
echo ""
echo "🔧 Next steps:"
echo "   1. Test webhook endpoint: POST /webhooks/nowpayments"
echo "   2. Test crypto payments: POST /crypto-payments/create-payment"
echo "   3. Test chat endpoints: POST /chat/check-existing"
echo "   4. Verify authentication works with valid JWT tokens"
echo ""
echo "🌐 Your Hostinger deployment is now updated with all the latest fixes!"
