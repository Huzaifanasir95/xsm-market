#!/bin/bash

# XSM Market - Direct Hostinger SSH Deployment Script

set -e

# Hostinger SSH Configuration
HOSTINGER_HOST="46.202.186.89"
HOSTINGER_USER="u718696665"
HOSTINGER_PORT="65002"
HOSTINGER_PASSWORD="Hello12@69"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Test SSH connection
test_ssh_connection() {
    echo -e "${BLUE}🔍 Testing SSH connection to Hostinger...${NC}"

    # Create expect script for SSH testing
    cat > /tmp/test_ssh.exp << EOF
#!/usr/bin/expect -f
set timeout 30
spawn ssh -p $HOSTINGER_PORT $HOSTINGER_USER@$HOSTINGER_HOST "echo 'SSH connection successful'"
expect {
    "password:" {
        send "$HOSTINGER_PASSWORD\r"
        expect {
            "SSH connection successful" {
                exit 0
            }
            timeout {
                exit 1
            }
        }
    }
    "SSH connection successful" {
        exit 0
    }
    timeout {
        exit 1
    }
}
EOF

    chmod +x /tmp/test_ssh.exp

    if /tmp/test_ssh.exp; then
        print_status "SSH connection successful"
        rm /tmp/test_ssh.exp
        return 0
    else
        print_error "SSH connection failed"
        rm /tmp/test_ssh.exp
        exit 1
    fi
}

# Build frontend
build_frontend() {
    echo -e "${BLUE}🔨 Building frontend...${NC}"

    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi

    npm run build

    if [ $? -eq 0 ]; then
        print_status "Frontend build completed"
    else
        print_error "Frontend build failed"
        exit 1
    fi
}

# Create deployment package
create_deployment_package() {
    echo -e "${BLUE}📦 Creating deployment package...${NC}"

    # Clean up old deployment directory
    rm -rf deployment
    mkdir -p deployment

    # Copy frontend files
    cp -r dist/* deployment/

    # Copy PHP backend files
    cp -r php-backend/* deployment/

    # Copy environment files
    cp .env.production deployment/.env.production 2>/dev/null || true

    print_status "Deployment package created"
}

# Deploy via SSH
deploy_via_ssh() {
    echo -e "${BLUE}🚀 Deploying to Hostinger via SSH...${NC}"

    # Create expect script for deployment
    cat > /tmp/deploy_ssh.exp << EOF
#!/usr/bin/expect -f
set timeout 300

# Start SSH session
spawn ssh -p $HOSTINGER_PORT $HOSTINGER_USER@$HOSTINGER_HOST

# Handle initial connection
expect {
    "password:" {
        send "$HOSTINGER_PASSWORD\r"
    }
    timeout {
        exit 1
    }
}

# Wait for shell prompt
expect {
    "$" {
        # Create backup of current public_html
        send "cp -r public_html public_html_backup_\$(date +%Y%m%d_%H%M%S)\r"
        expect "$"

        # Remove old files (keep .htaccess and other config files)
        send "cd public_html\r"
        expect "$"
        send "rm -rf assets/ *.html *.js *.css *.json *.png *.ico *.svg *.webmanifest\r"
        expect "$"
        send "rm -rf api/\r"
        expect "$"

        # Confirm we're ready to receive files
        send "pwd && ls -la\r"
        expect "$"
    }
    timeout {
        exit 1
    }
}

# Exit SSH session
send "exit\r"
expect eof
EOF

    chmod +x /tmp/deploy_ssh.exp

    if /tmp/deploy_ssh.exp; then
        print_status "SSH deployment setup completed"
        rm /tmp/deploy_ssh.exp
    else
        print_error "SSH deployment setup failed"
        rm /tmp/deploy_ssh.exp
        exit 1
    fi
}

# Upload files via SCP
upload_files() {
    echo -e "${BLUE}📤 Uploading files to Hostinger...${NC}"

    # Create expect script for SCP upload
    cat > /tmp/scp_upload.exp << EOF
#!/usr/bin/expect -f
set timeout 300

# Upload frontend files
spawn scp -P $HOSTINGER_PORT -r deployment/* $HOSTINGER_USER@$HOSTINGER_HOST:~/public_html/

expect {
    "password:" {
        send "$HOSTINGER_PASSWORD\r"
    }
    timeout {
        exit 1
    }
}

expect {
    "100%" {
        # Files uploaded successfully
    }
    eof {
        # Upload completed
    }
}
EOF

    chmod +x /tmp/scp_upload.exp

    if /tmp/scp_upload.exp; then
        print_status "Files uploaded successfully"
        rm /tmp/scp_upload.exp
    else
        print_error "File upload failed"
        rm /tmp/scp_upload.exp
        exit 1
    fi
}

# Verify deployment
verify_deployment() {
    echo -e "${BLUE}🔍 Verifying deployment...${NC}"

    # Create expect script for verification
    cat > /tmp/verify_ssh.exp << EOF
#!/usr/bin/expect -f
set timeout 30

spawn ssh -p $HOSTINGER_PORT $HOSTINGER_USER@$HOSTINGER_HOST

expect {
    "password:" {
        send "$HOSTINGER_PASSWORD\r"
    }
    timeout {
        exit 1
    }
}

expect {
    "$" {
        # Check if files exist
        send "cd public_html && ls -la index.html && ls -la api/index.php\r"
        expect "$"

        # Check file permissions
        send "ls -la public_html/index.html && ls -la public_html/api/index.php\r"
        expect "$"
    }
    timeout {
        exit 1
    }
}

send "exit\r"
expect eof
EOF

    chmod +x /tmp/verify_ssh.exp

    if /tmp/verify_ssh.exp; then
        print_status "Deployment verification completed"
        rm /tmp/verify_ssh.exp
    else
        print_warning "Deployment verification had issues"
        rm /tmp/verify_ssh.exp
    fi
}

# Main deployment process
main() {
    echo -e "${BLUE}🎯 Starting direct Hostinger deployment...${NC}"
    echo ""

    test_ssh_connection
    build_frontend
    create_deployment_package
    deploy_via_ssh
    upload_files
    verify_deployment

    echo ""
    echo -e "${GREEN}🎉 Deployment to Hostinger completed!${NC}"
    echo ""
    echo -e "${YELLOW}📋 Next steps:${NC}"
    echo "1. Visit https://xsmmarket.com to test your application"
    echo "2. Check https://xsmmarket.com/api/health.php for API status"
    echo "3. If issues occur, check the backup directories on your server"
    echo ""
    echo -e "${BLUE}🔗 Test URLs:${NC}"
    echo "Frontend: https://xsmmarket.com"
    echo "API: https://xsmmarket.com/api"
    echo "Health Check: https://xsmmarket.com/api/health.php"
}

# Run main function
main
