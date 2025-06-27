#!/bin/bash

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"

echo "🗄️ Setting up local MariaDB/MySQL database for XSM Market..."
echo ""

# Check if MySQL/MariaDB is running
echo "🔍 Checking if MySQL/MariaDB is available..."

# Try different common MySQL/MariaDB commands
MYSQL_CMD=""
if command -v mysql &> /dev/null; then
    MYSQL_CMD="mysql"
elif command -v mariadb &> /dev/null; then
    MYSQL_CMD="mariadb"
else
    echo "❌ MySQL/MariaDB is not installed or not in PATH"
    echo "Please install MySQL or MariaDB first:"
    echo "  macOS: brew install mariadb"
    echo "  Ubuntu: sudo apt install mariadb-server"
    echo "  Windows: Download from https://mariadb.org/download/"
    exit 1
fi

echo "✅ Found $MYSQL_CMD"

# Check if MySQL/MariaDB service is running
echo "🔍 Checking if database service is running..."
if ! pgrep -x "mysqld" > /dev/null && ! pgrep -x "mariadbd" > /dev/null; then
    echo "⚠️ Database service might not be running."
    echo "Try starting it:"
    echo "  macOS: brew services start mariadb"
    echo "  Linux: sudo systemctl start mariadb"
    echo ""
    echo "Continuing anyway..."
fi

# Database configuration
DB_NAME="xsm_market_local"
DB_USER="xsm_user"
DB_HOST="localhost"
DB_PASSWORD="localpassword123"

echo "📋 Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Try different connection methods
echo "🔍 Testing database connection..."

# Method 1: Try with configured credentials
echo "Testing connection with configured credentials..."
MYSQL_CONNECT="$MYSQL_CMD -h $DB_HOST -u $DB_USER -p$DB_PASSWORD"
if $MYSQL_CONNECT -e "SELECT 1;" &> /dev/null; then
    echo "✅ Connected with configured credentials!"
else
    # Method 2: Try without password first (for root with no password)
    echo "Trying root connection without password..."
    if $MYSQL_CMD -h $DB_HOST -u root -e "SELECT 1;" &> /dev/null; then
        echo "✅ Connected as root without password!"
        DB_USER="root"
        DB_PASSWORD=""
        MYSQL_CONNECT="$MYSQL_CMD -h $DB_HOST -u $DB_USER"
    else
        # Method 3: Ask for password
        echo "Password required. Please enter your MySQL/MariaDB root password:"
        read -s ROOT_PASSWORD
        echo ""
        
        if [ -n "$ROOT_PASSWORD" ]; then
            MYSQL_CONNECT="$MYSQL_CMD -h $DB_HOST -u root -p$ROOT_PASSWORD"
            if ! $MYSQL_CONNECT -e "SELECT 1;" &> /dev/null; then
                echo "❌ Failed to connect with password. Please check:"
                echo "  1. Database service is running"
                echo "  2. Root password is correct"
                echo "  3. Root user has proper permissions"
                exit 1
            fi
            DB_USER="root"
            DB_PASSWORD="$ROOT_PASSWORD"
        else
            echo "❌ Failed to connect. Please check your database setup."
            exit 1
        fi
    fi
fi

echo "✅ Database connection successful!"

# Create database if it doesn't exist
echo "🏗️ Creating database '$DB_NAME'..."
$MYSQL_CONNECT -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if [ $? -eq 0 ]; then
    echo "✅ Database '$DB_NAME' created successfully!"
else
    echo "❌ Failed to create database"
    exit 1
fi

# Update backend .env file
echo "🔧 Updating backend .env file..."
ENV_FILE="$BACKEND_DIR/.env"

# Create/update .env file with proper database credentials
cat > "$ENV_FILE" << EOF
# Local MariaDB Configuration
DB_HOST=$DB_HOST
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_PORT=3306

# Application Settings
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=xsm-market-secret-key-2025
JWT_REFRESH_SECRET=xsm-market-refresh-secret-key-2025

# Google OAuth Configuration
GOOGLE_CLIENT_ID=706026691678-kbn3pqlj9f5t7o8sri6lf5ucgi03btjb.apps.googleusercontent.com

# Email Configuration
GMAIL_USER=Tiktokwaalii2@gmail.com
GMAIL_PASSWORD=your_gmail_app_password_here
EOF

echo "✅ Backend .env file updated!"

# Run database setup from Node.js
echo "🔧 Setting up database tables..."
cd "$BACKEND_DIR"

if [ ! -f "$BACKEND_DIR/package.json" ]; then
    echo "❌ Backend directory not found at: $BACKEND_DIR"
    exit 1
fi

echo "Running npm run setup-db in $(pwd)..."
npm run setup-db

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Local database setup complete!"
    echo ""
    echo "📋 Database Details:"
    echo "  Host: $DB_HOST"
    echo "  Database: $DB_NAME"
    echo "  User: $DB_USER"
    echo "  Password: $DB_PASSWORD"
    echo ""
    echo "✅ Backend .env file updated with database credentials"
    echo "🚀 You can now run: npm run dev"
else
    echo "❌ Failed to setup database tables"
    exit 1
fi
