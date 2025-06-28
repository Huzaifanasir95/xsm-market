#!/bin/bash

echo "🚀 XSM Market - Production Deployment Script"
echo "============================================="
echo ""

# Configuration
DOMAIN="xsmmarket.com"
PRODUCTION_API_URL="https://xsmmarket.com/api"
DEPLOY_DIR="xsm-market-production-$(date +%Y%m%d_%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to clean up development files
cleanup_dev_files() {
    print_status "Cleaning up development and debug files..."
    
    # Remove debug files
    rm -f debug-*.js test-*.js clear-*.js create-user-*.js
    rm -f backend/debug-*.js backend/test-*.js backend/clear-*.js
    
    # Remove development logs
    rm -f *.log backend/*.log
    
    # Remove temporary files
    rm -f *.tmp */*.tmp
    find . -name "*.backup" -delete
    find . -name ".DS_Store" -delete
    
    print_success "Development files cleaned up"
}

# Function to update frontend for production
prepare_frontend() {
    print_status "Preparing frontend for production..."
    
    # Update package.json to include production API URL
    if [ ! -f "package.json.backup" ]; then
        cp package.json package.json.backup
    fi
    
    # Create .env.production for frontend build
    cat > .env.production << EOF
VITE_API_URL=https://xsmmarket.com/api
EOF
    
    print_success "Frontend configured for production"
}

# Function to build frontend
build_frontend() {
    print_status "Building frontend for production..."
    
    # Install dependencies
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
    fi
    
    # Build for production
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Frontend build completed successfully"
    else
        print_error "Frontend build failed"
        exit 1
    fi
}

# Function to prepare backend
prepare_backend() {
    print_status "Preparing backend for production..."
    
    cd backend
    
    # Install production dependencies
    if [ ! -d "node_modules" ]; then
        print_status "Installing backend dependencies..."
        npm install --production
    fi
    
    # Copy production environment file
    cp ../.env.production .env
    
    cd ..
    print_success "Backend prepared for production"
}

# Function to create deployment package
create_deployment_package() {
    print_status "Creating deployment package..."
    
    # Create deployment directory
    mkdir -p "$DEPLOY_DIR"
    
    # Copy essential files
    cp -r dist/ "$DEPLOY_DIR/"
    cp -r backend/ "$DEPLOY_DIR/"
    cp package.json "$DEPLOY_DIR/"
    cp .env.production "$DEPLOY_DIR/.env"
    
    # Copy production database setup
    cp backend/setup-database.js "$DEPLOY_DIR/backend/"
    
    # Create deployment instructions
    cat > "$DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md" << 'EOF'
# XSM Market - Production Deployment Instructions

## 1. Upload Files to Hostinger

Upload the following to your Hostinger file manager:
- All files from the `dist/` folder → Upload to your domain's public_html folder
- All files from the `backend/` folder → Upload to a folder called `api` in public_html
- The `.env` file → Upload to the `api` folder

## 2. Database Setup

1. Log into your Hostinger hPanel
2. Go to MySQL Databases
3. Create database: `u718696665_xsm_market_db`
4. Create user: `u718696665_xsm_user` with password: `HamzaZain123`
5. Run the database setup script:
   - Go to File Manager → api folder
   - Run: `node setup-database.js`

## 3. Node.js App Setup

1. In hPanel, go to Node.js
2. Create new Node.js app:
   - Entry point: `server.js`
   - Application folder: `/public_html/api`
   - Environment: Production
3. Set environment variables from the `.env` file
4. Start the application

## 4. Domain Configuration

Make sure your domain points to the correct folders:
- Main domain (xsmmarket.com) → public_html (frontend)
- API subdirectory (xsmmarket.com/api) → public_html/api (backend)

## 5. SSL Certificate

Enable SSL certificate in Hostinger for HTTPS support.

Your app should now be live at https://xsmmarket.com
EOF

    # Create a compressed package
    tar -czf "${DEPLOY_DIR}.tar.gz" "$DEPLOY_DIR"
    
    print_success "Deployment package created: ${DEPLOY_DIR}.tar.gz"
}

# Function to export database schema
export_database() {
    print_status "Creating database export..."
    
    # Create database export script
    cat > "$DEPLOY_DIR/backend/export-database.sql" << 'EOF'
-- XSM Market Database Schema Export
-- Generated for production deployment

SET FOREIGN_KEY_CHECKS = 0;

-- Create users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `fullName` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `profilePicture` text DEFAULT NULL,
  `googleId` varchar(255) DEFAULT NULL,
  `authProvider` enum('email','google') NOT NULL DEFAULT 'email',
  `isEmailVerified` tinyint(1) NOT NULL DEFAULT 0,
  `isVerified` tinyint(1) NOT NULL DEFAULT 0,
  `emailOTP` varchar(10) DEFAULT NULL,
  `otpExpires` datetime DEFAULT NULL,
  `passwordResetToken` varchar(255) DEFAULT NULL,
  `passwordResetExpires` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create ads table
CREATE TABLE IF NOT EXISTS `ads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `channelUrl` varchar(500) NOT NULL,
  `platform` enum('facebook','instagram','twitter','tiktok','youtube') NOT NULL,
  `category` varchar(100) NOT NULL,
  `contentType` enum('Unique content','Rewritten','Not unique content','Mixed') DEFAULT NULL,
  `contentCategory` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `subscribers` int(11) DEFAULT 0,
  `monthlyIncome` decimal(10,2) DEFAULT 0.00,
  `isMonetized` tinyint(1) NOT NULL DEFAULT 0,
  `incomeDetails` text DEFAULT NULL,
  `promotionDetails` text DEFAULT NULL,
  `status` enum('active','pending','sold','suspended','rejected') NOT NULL DEFAULT 'active',
  `verified` tinyint(1) NOT NULL DEFAULT 0,
  `premium` tinyint(1) NOT NULL DEFAULT 0,
  `views` int(11) NOT NULL DEFAULT 0,
  `totalViews` bigint(20) DEFAULT 0,
  `rating` decimal(2,1) DEFAULT 0.0,
  `thumbnail` text DEFAULT NULL,
  `screenshots` json DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `adminNotes` text DEFAULT NULL,
  `soldAt` datetime DEFAULT NULL,
  `soldTo` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `soldTo` (`soldTo`),
  CONSTRAINT `ads_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ads_ibfk_2` FOREIGN KEY (`soldTo`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
EOF

    print_success "Database schema exported"
}

# Function to create production server.js
create_production_server() {
    print_status "Creating production server configuration..."
    
    cat > "$DEPLOY_DIR/backend/server.js" << 'EOF'
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const adRoutes = require('./routes/ads');
const userRoutes = require('./routes/user');

const app = express();

// CORS configuration for production
const corsOptions = {
  origin: ['https://xsmmarket.com', 'https://www.xsmmarket.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/user', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'XSM Market API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

const PORT = process.env.PORT || 5000;

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 XSM Market API running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📊 Database: Connected`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error('Error:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error('Error:', error);
  process.exit(1);
});

startServer();

module.exports = app;
EOF

    print_success "Production server configuration created"
}

# Main deployment process
main() {
    print_status "Starting XSM Market production deployment..."
    echo ""
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root directory."
        exit 1
    fi
    
    # Run deployment steps
    cleanup_dev_files
    prepare_frontend
    build_frontend
    prepare_backend
    create_deployment_package
    export_database
    create_production_server
    
    echo ""
    print_success "🎉 Deployment package created successfully!"
    echo ""
    print_status "📦 Deployment package: ${DEPLOY_DIR}.tar.gz"
    print_status "📁 Deployment folder: ${DEPLOY_DIR}/"
    print_status "📋 Instructions: ${DEPLOY_DIR}/DEPLOYMENT_INSTRUCTIONS.md"
    echo ""
    print_warning "Next steps:"
    echo "1. Extract the deployment package"
    echo "2. Upload files to your Hostinger account as per instructions"
    echo "3. Configure your Node.js app in Hostinger hPanel"
    echo "4. Import the database schema"
    echo "5. Your app will be live at https://xsmmarket.com"
    echo ""
}

# Run the deployment
main
