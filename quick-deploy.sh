#!/bin/bash

# Quick Deploy Script for XSM Market to Hosting# Upload files
echo -e "${BLUE}📤 Uploading files to Hostinger...${NC}"
echo "You'll be prompted for the SSH password: Hello12@69"

# Upload frontend files
echo "Uploading to: $REMOTE_PATH"
scp -P $PORT -r deployment-package/* $USER@$HOST:$REMOTE_PATH/

if [ $? -eq 0 ]; then
    print_status "Files uploaded successfully to $REMOTE_PATH"
else
    print_warning "Upload completed with warnings"
fi

# Cleanup
rm -rf deployment-packageick-deploy.sh

set -e

echo "🚀 Quick Deploy to Hostinger"
echo "============================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Hostinger SSH Config
HOST="46.202.186.89"
PORT="65002"
USER="u718696665"
REMOTE_PATH="/domains/xsmmarket.com/public_html"

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Build frontend
echo -e "${BLUE}🔨 Building frontend...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run build
print_status "Frontend built"

# Create deployment package
echo -e "${BLUE}📦 Creating deployment package...${NC}"
rm -rf deployment-package
mkdir -p deployment-package

# Copy built frontend files
cp -r dist/* deployment-package/

# Copy PHP backend files
cp -r php-backend/* deployment-package/

# Copy configuration files
cp hostinger-deployment/public_html_6_12/.htaccess deployment-package/
cp .env.production deployment-package/

print_status "Deployment package ready"

# Upload files
echo -e "${BLUE}📤 Uploading to Hostinger...${NC}"
echo "You'll be prompted for the SSH password: Hello12@69"

# Upload frontend files
echo "Uploading to: $REMOTE_PATH"
scp -P $PORT -r temp_deploy/* $USER@$HOST:$REMOTE_PATH/

if [ $? -eq 0 ]; then
    print_status "Files uploaded successfully to $REMOTE_PATH"
else
    print_warning "Upload completed with warnings"
fi

# Cleanup
rm -rf temp_deploy

echo ""
echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo ""
echo -e "${BLUE}🌐 Test your application:${NC}"
echo "Frontend: https://xsmmarket.com"
echo "API: https://xsmmarket.com/api"
echo "Health Check: https://xsmmarket.com/api/health.php"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Visit https://xsmmarket.com"
echo "2. Test user registration and login"
echo "3. Check browser console for any errors"
echo ""
print_info "If you encounter issues, check MANUAL_HOSTINGER_DEPLOY.md"
