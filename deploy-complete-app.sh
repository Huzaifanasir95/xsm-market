#!/bin/bash

echo "🚀 XSM Market - Complete App Deployment Script"
echo "=============================================="
echo ""

# Configuration
DOMAIN="xsmmarket.com"
API_URL="https://$DOMAIN/api"
LOCAL_API_URL="http://localhost:5000/api"
DEPLOY_DIR="xsm-market-full-deploy-$(date +%Y%m%d_%H%M%S)"

echo "🌐 Domain: $DOMAIN"
echo "🔗 API URL: $API_URL"
echo ""

# Function to update API URLs in frontend
update_frontend_api_urls() {
    echo "🔧 Updating frontend API URLs..."
    
    # Create backup of original auth.ts
    cp src/services/auth.ts src/services/auth.ts.backup
    
    # Update API URL in auth.ts
    sed -i.tmp "s|const API_URL = '$LOCAL_API_URL'|const API_URL = '$API_URL'|g" src/services/auth.ts
    rm src/services/auth.ts.tmp 2>/dev/null
    
    echo "✅ Updated API URL from $LOCAL_API_URL to $API_URL"
}

# Function to build frontend
build_frontend() {
    echo "📦 Building frontend for production..."
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📥 Installing frontend dependencies..."
        npm install
    fi
    
    # Build for production
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Frontend build successful"
    else
        echo "❌ Frontend build failed"
        exit 1
    fi
}

# Function to create deployment package
create_deployment_package() {
    echo "📦 Creating complete deployment package..."
    
    # Create deployment directory
    mkdir -p $DEPLOY_DIR
    
    # Copy frontend build
    echo "📁 Copying frontend build..."
    cp -r dist/* $DEPLOY_DIR/
    
    # Copy backend
    echo "📁 Copying backend..."
    mkdir -p $DEPLOY_DIR/api
    cp -r backend/* $DEPLOY_DIR/api/
    
    # Remove unnecessary files from backend
    rm -rf $DEPLOY_DIR/api/node_modules
    rm -f $DEPLOY_DIR/api/.env
    rm -f $DEPLOY_DIR/api/.env.local
    rm -f $DEPLOY_DIR/api/docker-compose.yml
    rm -f $DEPLOY_DIR/api/*.sql
    rm -f $DEPLOY_DIR/api/*.sh
    
    # Copy production environment for backend
    cp backend/.env.production $DEPLOY_DIR/api/.env
    
    # Create .htaccess for frontend routing
    cat > $DEPLOY_DIR/.htaccess << 'EOF'
# Enable rewrite engine
RewriteEngine On

# Handle API requests - proxy to Node.js app
RewriteRule ^api/(.*)$ /api/$1 [QSA,L]

# Handle React Router - redirect all non-file requests to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
EOF

    # Create deployment instructions
    cat > $DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# 🚀 XSM Market - Complete Application Deployment

## 📁 Package Contents
- **Frontend**: All React build files (index.html, assets/, etc.)
- **Backend**: Node.js API in `/api/` folder
- **.htaccess**: Apache configuration for routing and optimization

## 🎯 Hostinger Deployment Steps

### 1. Upload Files
1. Upload entire package to your domain's `public_html` folder
2. Ensure all files are in the root directory

### 2. Configure Node.js Application
In Hostinger hPanel:
- Go to **Node.js** section
- **Application Root**: `/public_html/api`
- **Startup File**: `server.js`
- **Node.js Version**: 18.x or 20.x

### 3. Set Environment Variables
Add these in Node.js application settings:

```
DB_HOST=localhost
DB_NAME=u718696665_xsm_market_db
DB_USER=u718696665_xsm_user
DB_PASSWORD=HamzaZain123
DB_PORT=3306
PORT=5000
NODE_ENV=production
JWT_SECRET=xsm-market-secret-key-2025
JWT_REFRESH_SECRET=xsm-market-refresh-secret-key-2025
GOOGLE_CLIENT_ID=706026691678-kbn3pqlj9f5t7o8sri6lf5ucgi03btjb.apps.googleusercontent.com
GMAIL_USER=Tiktokwaalii2@gmail.com
GMAIL_APP_PASSWORD=ytaj wcfp kpya ziqj
FRONTEND_URL=https://xsmmarket.com
```

### 4. Install Dependencies & Setup Database
Using terminal or SSH:
```bash
cd public_html/api
npm install
npm run setup-db
```

### 5. Start Node.js Application
- Click **Start Application** in hPanel

### 6. Test Your Application
- **Frontend**: https://xsmmarket.com
- **API Health**: https://xsmmarket.com/api/health
- **Registration**: https://xsmmarket.com/api/auth/register

## 📋 File Structure After Deployment

```
public_html/
├── index.html          # React app entry point
├── assets/             # CSS, JS, images
├── .htaccess          # Apache configuration
└── api/               # Backend API
    ├── server.js
    ├── package.json
    ├── .env
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    └── utils/
```

## 🔍 Troubleshooting

### Frontend Issues:
- Check .htaccess file is uploaded
- Verify all assets are in correct directories
- Check browser console for errors

### Backend Issues:
- Check Node.js logs in hPanel
- Verify environment variables are set
- Test API endpoints directly

### Database Issues:
- Check database connection in phpMyAdmin
- Verify user privileges
- Run setup script if tables missing

## ✅ Success Indicators

Your deployment is successful when:
- [ ] Frontend loads at https://xsmmarket.com
- [ ] API responds at https://xsmmarket.com/api/health
- [ ] User registration works
- [ ] User login works
- [ ] No console errors in browser

🎉 Your complete XSM Market application is now live!
EOF

    echo "✅ Deployment package created: $DEPLOY_DIR"
    
    # Create zip file
    if command -v zip &> /dev/null; then
        echo "📦 Creating zip file..."
        zip -r "${DEPLOY_DIR}.zip" $DEPLOY_DIR
        echo "✅ Created: ${DEPLOY_DIR}.zip"
    fi
}

# Function to restore original files
restore_original_files() {
    echo "🔄 Restoring original files..."
    if [ -f "src/services/auth.ts.backup" ]; then
        mv src/services/auth.ts.backup src/services/auth.ts
        echo "✅ Restored original auth.ts"
    fi
}

# Main execution
echo "🚀 Starting complete deployment process..."
echo ""

# Step 1: Update API URLs
update_frontend_api_urls

# Step 2: Build frontend
build_frontend

# Step 3: Create deployment package
create_deployment_package

# Step 4: Restore original files
restore_original_files

echo ""
echo "🎉 Complete deployment package ready!"
echo ""
echo "📋 Next steps:"
echo "1. Upload ${DEPLOY_DIR}.zip to Hostinger File Manager"
echo "2. Extract to public_html directory"
echo "3. Follow DEPLOYMENT_INSTRUCTIONS.md"
echo ""
echo "🌐 Your app will be available at:"
echo "   Frontend: https://$DOMAIN"
echo "   API: https://$DOMAIN/api"
