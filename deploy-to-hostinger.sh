#!/bin/bash

# XSM Market Hostinger Deployment Script
# This script builds and deploys the application to Hostinger

set -e  # Exit on any error

echo "🚀 Starting XSM Market deployment to Hostinger..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_DIR="hostinger-deployment/public_html_6_12"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "Deployment Directory: $DEPLOYMENT_DIR"
echo "Timestamp: $TIMESTAMP"
echo ""

# Function to print status messages
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    echo -e "${BLUE}🔍 Checking dependencies...${NC}"

    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi

    print_status "Dependencies check passed"
}

# Build frontend
build_frontend() {
    echo -e "${BLUE}🔨 Building frontend...${NC}"

    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi

    # Build with production environment
    npm run build

    if [ $? -eq 0 ]; then
        print_status "Frontend build completed"
    else
        print_error "Frontend build failed"
        exit 1
    fi
}

# Copy frontend files
copy_frontend() {
    echo -e "${BLUE}📦 Copying frontend files...${NC}"

    # Create backup of current deployment
    if [ -d "$DEPLOYMENT_DIR/index.html" ]; then
        echo "Creating backup of current deployment..."
        cp -r "$DEPLOYMENT_DIR" "${DEPLOYMENT_DIR}_backup_$TIMESTAMP"
        print_status "Backup created: ${DEPLOYMENT_DIR}_backup_$TIMESTAMP"
    fi

    # Copy built frontend files
    cp -r dist/* "$DEPLOYMENT_DIR/"

    print_status "Frontend files copied"
}

# Copy backend files
copy_backend() {
    echo -e "${BLUE}📦 Copying backend files...${NC}"

    # Copy PHP backend files
    cp -r php-backend/* "$DEPLOYMENT_DIR/api/"

    print_status "Backend files copied"
}

# Update environment files
update_environment() {
    echo -e "${BLUE}🔧 Updating environment files...${NC}"

    # Copy production environment file
    if [ -f ".env.production" ]; then
        cp .env.production "$DEPLOYMENT_DIR/.env.production"
        print_status "Production environment file updated"
    fi

    # Ensure backend has proper .env file
    if [ -f "php-backend/.env" ]; then
        cp php-backend/.env "$DEPLOYMENT_DIR/api/.env"
        print_status "Backend environment file updated"
    fi
}

# Clean up unnecessary files
cleanup() {
    echo -e "${BLUE}🧹 Cleaning up...${NC}"

    # Remove any .git directories that might have been copied
    find "$DEPLOYMENT_DIR" -name ".git*" -type d -exec rm -rf {} + 2>/dev/null || true

    # Remove node_modules if copied
    if [ -d "$DEPLOYMENT_DIR/node_modules" ]; then
        rm -rf "$DEPLOYMENT_DIR/node_modules"
        print_status "Removed node_modules from deployment"
    fi

    # Remove any log files
    find "$DEPLOYMENT_DIR" -name "*.log" -type f -delete 2>/dev/null || true

    print_status "Cleanup completed"
}

# Verify deployment
verify_deployment() {
    echo -e "${BLUE}🔍 Verifying deployment...${NC}"

    # Check if essential files exist
    essential_files=(
        "$DEPLOYMENT_DIR/index.html"
        "$DEPLOYMENT_DIR/api/index.php"
        "$DEPLOYMENT_DIR/.env.production"
    )

    for file in "${essential_files[@]}"; do
        if [ -f "$file" ]; then
            print_status "Found: $(basename "$file")"
        else
            print_warning "Missing: $(basename "$file")"
        fi
    done

    # Check file permissions
    if [ -f "$DEPLOYMENT_DIR/api/index.php" ]; then
        if [ -x "$DEPLOYMENT_DIR/api/index.php" ]; then
            print_status "API file has execute permissions"
        else
            print_warning "API file may need execute permissions on server"
        fi
    fi
}

# Create deployment archive
create_archive() {
    echo -e "${BLUE}📦 Creating deployment archive...${NC}"

    ARCHIVE_NAME="xsm-market-deployment-$TIMESTAMP.zip"

    cd "$DEPLOYMENT_DIR"
    zip -r "../$ARCHIVE_NAME" . -x "*.git*" "*.DS_Store" "*/node_modules/*" "*.log"

    echo -e "${GREEN}📁 Deployment archive created: $ARCHIVE_NAME${NC}"
    echo -e "${YELLOW}📤 Upload this file to your Hostinger File Manager${NC}"
}

# Main deployment process
main() {
    echo -e "${BLUE}🎯 Starting deployment process...${NC}"
    echo ""

    check_dependencies
    build_frontend
    copy_frontend
    copy_backend
    update_environment
    cleanup
    verify_deployment
    create_archive

    echo ""
    echo -e "${GREEN}🎉 Deployment preparation completed!${NC}"
    echo ""
    echo -e "${YELLOW}📋 Next steps:${NC}"
    echo "1. Upload the generated ZIP file to your Hostinger File Manager"
    echo "2. Extract it to your public_html directory"
    echo "3. Test your application at https://xsmmarket.com"
    echo ""
    echo -e "${BLUE}🔗 URLs to test:${NC}"
    echo "Frontend: https://xsmmarket.com"
    echo "API: https://xsmmarket.com/api"
    echo "Health Check: https://xsmmarket.com/api/health.php"
}

# Handle command line arguments
case "${1:-}" in
    "frontend-only")
        echo -e "${BLUE}🚀 Deploying frontend only...${NC}"
        check_dependencies
        build_frontend
        copy_frontend
        update_environment
        cleanup
        verify_deployment
        create_archive
        ;;
    "backend-only")
        echo -e "${BLUE}🚀 Deploying backend only...${NC}"
        copy_backend
        update_environment
        cleanup
        verify_deployment
        create_archive
        ;;
    "verify")
        verify_deployment
        ;;
    *)
        main
        ;;
esac
