#!/bin/bash

# XSM Market PHP Backend Deployment Script
# This script helps prepare the PHP backend for deployment to Hostinger

echo "🚀 XSM Market PHP Backend Deployment Preparation"
echo "================================================"

# Create deployment directory
DEPLOY_DIR="xsm-php-backend-deploy"
echo "📁 Creating deployment directory: $DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# Copy all necessary files
echo "📋 Copying files..."
cp -r php-backend/* "$DEPLOY_DIR/"

# Create .env file from example
if [ ! -f "$DEPLOY_DIR/.env" ]; then
    echo "⚙️ Creating .env file from example..."
    cp "$DEPLOY_DIR/.env.example" "$DEPLOY_DIR/.env"
    echo "⚠️  Please edit .env file with your actual configuration!"
fi

# Set proper permissions (for local development)
echo "🔐 Setting file permissions..."
find "$DEPLOY_DIR" -type f -name "*.php" -exec chmod 644 {} \;
find "$DEPLOY_DIR" -type f -name ".htaccess" -exec chmod 644 {} \;
find "$DEPLOY_DIR" -type f -name ".env*" -exec chmod 600 {} \;
find "$DEPLOY_DIR" -type d -exec chmod 755 {} \;

# Create zip file for easy upload
echo "📦 Creating deployment zip file..."
zip -r "xsm-php-backend.zip" "$DEPLOY_DIR" -x "*.DS_Store" "*/node_modules/*" "*/.git/*"

echo ""
echo "✅ Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Upload 'xsm-php-backend.zip' to your Hostinger file manager"
echo "2. Extract the zip file to your public_html directory"
echo "3. Edit the .env file with your database credentials"
echo "4. Import the database schema from database_schema.sql"
echo "5. Test the API endpoint: https://yourdomain.com/api/health"
echo ""
echo "📖 For detailed instructions, see php-backend/README.md"
echo ""
echo "🔧 Configuration checklist:"
echo "   □ Update database credentials in .env"
echo "   □ Generate secure JWT secrets"
echo "   □ Configure email settings"
echo "   □ Set PHP_ENV=production for live site"
echo "   □ Import database schema"
echo "   □ Test all endpoints"
echo ""

# Verify critical files exist
echo "🔍 Verifying deployment package..."
CRITICAL_FILES=(
    "$DEPLOY_DIR/index.php"
    "$DEPLOY_DIR/.htaccess"
    "$DEPLOY_DIR/.env"
    "$DEPLOY_DIR/config/database.php"
    "$DEPLOY_DIR/controllers/AuthController.php"
    "$DEPLOY_DIR/controllers/ChatController.php"
    "$DEPLOY_DIR/models/User.php"
    "$DEPLOY_DIR/middleware/auth.php"
    "$DEPLOY_DIR/utils/jwt.php"
)

MISSING_FILES=()
for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo "✅ All critical files present"
else
    echo "❌ Missing critical files:"
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
fi

echo ""
echo "📊 Package contents:"
find "$DEPLOY_DIR" -type f | wc -l | xargs echo "Files:"
find "$DEPLOY_DIR" -type d | wc -l | xargs echo "Directories:"
du -sh "$DEPLOY_DIR" | cut -f1 | xargs echo "Size:"

echo ""
echo "🎉 Ready for deployment to Hostinger!"
echo "Upload xsm-php-backend.zip to your hosting and extract it."
