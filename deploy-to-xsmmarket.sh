#!/bin/bash

# XSM Market - Hostinger Domain-Specific Deployment Script
# Deploys to: /domains/xsmmarket.com/public_html/

set -e

echo "🚀 Deploying to Hostinger Domain: xsmmarket.com"
echo "==============================================="

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
DOMAIN_PATH="/domains/xsmmarket.com"
PUBLIC_HTML_PATH="$DOMAIN_PATH/public_html"

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Test SSH connection
test_connection() {
    echo -e "${BLUE}🔍 Testing SSH connection...${NC}"
    if ssh -p $PORT -o ConnectTimeout=10 -o StrictHostKeyChecking=no $USER@$HOST "echo 'SSH OK'" > /dev/null 2>&1; then
        print_status "SSH connection successful"
    else
        print_error "SSH connection failed"
        echo "Please check your SSH credentials and network connection"
        exit 1
    fi
}

# Build frontend
build_frontend() {
    echo -e "${BLUE}🔨 Building frontend...${NC}"
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    npm run build
    print_status "Frontend built"
}

# Create deployment package
create_deployment_package() {
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
}

# Backup current deployment
backup_current() {
    echo -e "${BLUE}💾 Creating backup on server...${NC}"

    BACKUP_CMD="cd $DOMAIN_PATH && cp -r public_html public_html_backup_$(date +%Y%m%d_%H%M%S) 2>/dev/null || true"

    if ssh -p $PORT $USER@$HOST "$BACKUP_CMD"; then
        print_status "Backup created on server"
    else
        print_warning "Could not create backup (might be first deployment)"
    fi
}

# Clear old files
clear_old_files() {
    echo -e "${BLUE}🧹 Clearing old files...${NC}"

    # Clear old files but keep .htaccess and other config files
    CLEAR_CMD="cd $PUBLIC_HTML_PATH && find . -name '.htaccess' -o -name '*.conf' | head -5"

    # Get list of files to keep
    KEEP_FILES=$(ssh -p $PORT $USER@$HOST "$CLEAR_CMD" 2>/dev/null || echo "")

    # Remove old files but keep important ones
    ssh -p $PORT $USER@$HOST "cd $PUBLIC_HTML_PATH && rm -rf assets/ *.html *.js *.css *.json *.png *.ico *.svg *.webmanifest *.txt 2>/dev/null || true"

    # Remove old API files
    ssh -p $PORT $USER@$HOST "rm -rf $PUBLIC_HTML_PATH/api/ 2>/dev/null || true"

    print_status "Old files cleared"
}

# Upload files
upload_files() {
    echo -e "${BLUE}📤 Uploading files to $PUBLIC_HTML_PATH...${NC}"

    echo "You'll be prompted for the SSH password: Hello12@69"
    echo "Uploading deployment package..."

    if scp -P $PORT -r deployment-package/* $USER@$HOST:$PUBLIC_HTML_PATH/; then
        print_status "Files uploaded successfully"
    else
        print_error "File upload failed"
        exit 1
    fi
}

# Set permissions
set_permissions() {
    echo -e "${BLUE}🔧 Setting file permissions...${NC}"

    PERMS_CMD="cd $PUBLIC_HTML_PATH && find . -type f -exec chmod 644 {} \; 2>/dev/null || true"
    PERMS_CMD="$PERMS_CMD && cd $PUBLIC_HTML_PATH && find . -type d -exec chmod 755 {} \; 2>/dev/null || true"
    PERMS_CMD="$PERMS_CMD && cd $PUBLIC_HTML_PATH && chmod +x api/*.php 2>/dev/null || true"

    if ssh -p $PORT $USER@$HOST "$PERMS_CMD"; then
        print_status "Permissions set"
    else
        print_warning "Could not set all permissions"
    fi
}

# Verify deployment
verify_deployment() {
    echo -e "${BLUE}🔍 Verifying deployment...${NC}"

    VERIFY_CMD="cd $PUBLIC_HTML_PATH && ls -la index.html && ls -la api/index.php 2>/dev/null || echo 'API not found'"

    echo "Checking deployed files:"
    ssh -p $PORT $USER@$HOST "$VERIFY_CMD"

    print_status "Deployment verification completed"
}

# Main deployment process
main() {
    test_connection
    build_frontend
    create_deployment_package
    backup_current
    clear_old_files
    upload_files
    set_permissions
    verify_deployment

    # Cleanup
    rm -rf deployment-package

    echo ""
    echo -e "${GREEN}🎉 Deployment to xsmmarket.com completed!${NC}"
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
    print_info "Your files are deployed to: $PUBLIC_HTML_PATH"
}

# Handle command line arguments
case "${1:-}" in
    "test")
        test_connection
        ;;
    "build-only")
        build_frontend
        ;;
    "verify")
        verify_deployment
        ;;
    *)
        main
        ;;
esac
