#!/bin/bash

echo "🚀 echo "📄 Creating production .env..."
cat > $DEPLOY_DIR/api/.env << 'EOF'
# Production MariaDB Configuration for Hostinger
DB_HOST=localhost
DB_NAME=u718696665_xsm_market_db
DB_USER=u718696665_xsm_user
DB_PASSWORD=HamzaZain123
DB_PORT=3306

# Application Settings
PORT=5000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=xsm-market-secret-key-2025
JWT_REFRESH_SECRET=xsm-market-refresh-secret-key-2025
    
# Google OAuth Configuration
GOOGLE_CLIENT_ID=706026691678-kbn3pqlj9f5t7o8sri6lf5ucgi03btjb.apps.googleusercontent.com

# Email Configuration
GMAIL_USER=Tiktokwaalii2@gmail.com
GMAIL_APP_PASSWORD=ytaj wcfp kpya ziqj

# Frontend URL
FRONTEND_URL=https://xsmmarket.com
EOF - FINAL CLEAN Deployment ZIP"
echo "==========================================="

# Create deployment directory
DEPLOY_DIR="xsm-final-clean"
rm -rf $DEPLOY_DIR
mkdir $DEPLOY_DIR
mkdir -p $DEPLOY_DIR/api

echo "📄 Creating production server.js..."
cp backend/server.js $DEPLOY_DIR/api/server.js

echo "📄 Copying backend structure..."
cp -r backend/controllers $DEPLOY_DIR/api/
cp -r backend/middleware $DEPLOY_DIR/api/
cp -r backend/models $DEPLOY_DIR/api/
cp -r backend/routes $DEPLOY_DIR/api/
cp -r backend/config $DEPLOY_DIR/api/
cp -r backend/utils $DEPLOY_DIR/api/

echo "� Creating production package.json..."
cat > $DEPLOY_DIR/api/.env << 'EOF'
DB_HOST=localhost
DB_NAME=u718696665_xsm_market_db
DB_USER=u718696665_xsm_user
DB_PASSWORD=HamzaZain123
DB_PORT=3306
PORT=5000
NODE_ENV=production
EOF

echo "📄 Creating package.json..."
cat > $DEPLOY_DIR/api/package.json << 'EOF'
{
  "name": "xsm-market-api",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "clean-db": "node clean-production-db.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "mysql2": "^3.14.1",
    "sequelize": "^6.37.7",
    "dotenv": "^16.6.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "google-auth-library": "^10.1.0",
    "nodemailer": "^7.0.3"
  }
}
EOF

echo "📄 Copying production database cleaner..."
cp backend/clean-production-db.js $DEPLOY_DIR/api/

echo "📄 Copying deployment guide..."
cp HOSTINGER_DEPLOYMENT.md $DEPLOY_DIR/

echo "🌐 Building frontend..."
npm run build
if [ -d "dist" ]; then
  cp -r dist/* $DEPLOY_DIR/
  echo "✅ Frontend built and copied"
fi

echo "📦 Creating final ZIP..."
zip -r xsm-final-clean.zip $DEPLOY_DIR/

echo ""
echo "🎉 FINAL CLEAN DEPLOYMENT READY!"
echo "================================="
echo "✅ File: xsm-final-clean.zip"
echo "📤 Upload to Hostinger and extract to public_html/"
echo ""
echo "🚀 Commands for Hostinger (run in order):"
echo "cd public_html/api"
echo "npm install"
echo "npm run clean-db    # Clean database for fresh start"
echo "pm2 start server.js --name xsm-api"
echo ""
echo "🧹 The database will be completely cleaned on deployment!"
echo "🎯 Fresh start: 0 users, 0 ads - ready for real users"

rm -rf $DEPLOY_DIR
