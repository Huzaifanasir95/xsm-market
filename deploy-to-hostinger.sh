#!/bin/bash

# Manual deployment script for Hostinger
# Usage: ./deploy-to-hostinger.sh

set -e

echo "🚀 Starting deployment to Hostinger..."

# Configuration (you can modify these)
REMOTE_USER="your-hostinger-username"
REMOTE_HOST="your-domain.com"
REMOTE_PATH="/home/$REMOTE_USER/domains/$REMOTE_HOST/public_html"
SSH_KEY_PATH="$HOME/.ssh/hostinger_deploy"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required files exist
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo -e "${RED}❌ SSH key not found at $SSH_KEY_PATH${NC}"
    echo "Please set up SSH key first. See DEPLOYMENT_GUIDE.md"
    exit 1
fi

# Build frontend
echo -e "${YELLOW}📦 Building frontend...${NC}"
npm run build

# Create deployment directory
echo -e "${YELLOW}📁 Preparing deployment files...${NC}"
rm -rf deployment
mkdir -p deployment/public_html

# Copy frontend build
cp -r dist/* deployment/public_html/

# Copy PHP backend
mkdir -p deployment/public_html/api
cp -r php-backend/* deployment/public_html/api/

# Copy configuration files
if [ -f "hostinger-deployment/public_html_6_12/.htaccess" ]; then
    cp hostinger-deployment/public_html_6_12/.htaccess deployment/public_html/
fi

if [ -f "hostinger-deployment/public_html_6_12/.env.production" ]; then
    cp hostinger-deployment/public_html_6_12/.env.production deployment/public_html/api/.env
fi

# Test SSH connection
echo -e "${YELLOW}🔑 Testing SSH connection...${NC}"
if ! ssh -i "$SSH_KEY_PATH" -o ConnectTimeout=10 "$REMOTE_USER@$REMOTE_HOST" "echo 'SSH connection successful'"; then
    echo -e "${RED}❌ SSH connection failed${NC}"
    echo "Please check your SSH configuration"
    exit 1
fi

# Create backup on server
echo -e "${YELLOW}💾 Creating backup on server...${NC}"
ssh -i "$SSH_KEY_PATH" "$REMOTE_USER@$REMOTE_HOST" "
    cd $REMOTE_PATH/.. && 
    if [ -d public_html ]; then 
        cp -r public_html public_html_backup_\$(date +%Y%m%d_%H%M%S) 
        echo 'Backup created'
    else 
        echo 'No existing deployment to backup'
    fi
"

# Upload files
echo -e "${YELLOW}📤 Uploading files to server...${NC}"
rsync -avz --progress \
    -e "ssh -i $SSH_KEY_PATH" \
    --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.DS_Store' \
    deployment/public_html/ \
    "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"

# Set proper permissions
echo -e "${YELLOW}🔧 Setting file permissions...${NC}"
ssh -i "$SSH_KEY_PATH" "$REMOTE_USER@$REMOTE_HOST" "
    cd $REMOTE_PATH && 
    find . -type f -name '*.php' -exec chmod 644 {} \; &&
    find . -type d -exec chmod 755 {} \; &&
    chmod 644 .htaccess 2>/dev/null || true &&
    chmod 644 api/.env 2>/dev/null || true
    echo 'Permissions set'
"

# Test deployment
echo -e "${YELLOW}🧪 Testing deployment...${NC}"
sleep 5

# Test frontend
if curl -f -s "https://$REMOTE_HOST" > /dev/null; then
    echo -e "${GREEN}✅ Frontend is responding${NC}"
else
    echo -e "${RED}❌ Frontend not responding${NC}"
fi

# Test API
if curl -f -s "https://$REMOTE_HOST/api/health" > /dev/null; then
    echo -e "${GREEN}✅ API is responding${NC}"
else
    echo -e "${RED}❌ API not responding${NC}"
fi

# Cleanup
rm -rf deployment

echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo -e "Frontend: https://$REMOTE_HOST"
echo -e "API: https://$REMOTE_HOST/api"

echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "- Check your website to ensure everything works"
echo "- Monitor error logs if issues occur"
echo "- Database and email settings are in api/.env"
