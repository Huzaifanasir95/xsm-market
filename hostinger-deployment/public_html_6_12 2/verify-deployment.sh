#!/bin/bash

# 🔍 XSM Market Deployment Structure Verification
echo "🔍 XSM MARKET DEPLOYMENT VERIFICATION"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: Run this script from public_html directory"
    echo "Current directory: $(pwd)"
    exit 1
fi

echo "📍 Checking deployment structure..."
echo ""

# Check main files
echo "🏠 FRONTEND FILES:"
files=("index.html" "favicon.ico" ".htaccess" ".env.production")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (MISSING)"
    fi
done

# Check assets directory
echo ""
echo "📦 ASSETS:"
if [ -d "assets" ]; then
    asset_count=$(ls -1 assets/ 2>/dev/null | wc -l)
    echo "✅ assets/ directory ($asset_count files)"
else
    echo "❌ assets/ directory (MISSING)"
fi

# Check API directory structure
echo ""
echo "🔌 API BACKEND:"
if [ -d "api" ]; then
    echo "✅ api/ directory exists"
    
    # Check critical API files
    api_files=("index.php" ".env" "health.php")
    for file in "${api_files[@]}"; do
        if [ -f "api/$file" ]; then
            echo "✅ api/$file"
        else
            echo "❌ api/$file (MISSING)"
        fi
    done
    
    # Check API subdirectories
    api_dirs=("config" "controllers" "models" "middleware" "utils" "uploads")
    for dir in "${api_dirs[@]}"; do
        if [ -d "api/$dir" ]; then
            file_count=$(ls -1 "api/$dir/" 2>/dev/null | wc -l)
            echo "✅ api/$dir/ ($file_count files)"
        else
            echo "❌ api/$dir/ (MISSING)"
        fi
    done
else
    echo "❌ api/ directory (MISSING - CRITICAL!)"
fi

echo ""
echo "🔐 ENVIRONMENT FILES:"
if [ -f ".env.production" ]; then
    echo "✅ Frontend environment (.env.production)"
else
    echo "❌ Frontend environment (.env.production) MISSING"
fi

if [ -f "api/.env" ]; then
    echo "✅ Backend environment (api/.env)"
    # Check if database config exists
    if grep -q "DB_NAME" api/.env; then
        echo "✅ Database configuration found"
    else
        echo "⚠️  Database configuration incomplete"
    fi
else
    echo "❌ Backend environment (api/.env) MISSING"
fi

echo ""
echo "📊 DEPLOYMENT SUMMARY:"
echo "======================"

# Count total files
total_files=$(find . -type f | wc -l)
echo "📁 Total files: $total_files"

# Check directory structure
if [ -f "index.html" ] && [ -d "api" ] && [ -f "api/index.php" ]; then
    echo "✅ DEPLOYMENT STRUCTURE: CORRECT"
    echo "🎯 Ready for Hostinger hosting!"
else
    echo "❌ DEPLOYMENT STRUCTURE: INCOMPLETE"
    echo "🚨 Fix missing files before uploading!"
fi

echo ""
echo "🌐 Next steps:"
echo "1. Upload this entire directory to Hostinger public_html"
echo "2. Import your database schema"
echo "3. Test: https://yoursite.com/api/health"
echo "4. Test: https://yoursite.com (frontend)"

echo ""
echo "🔧 If issues occur, check:"
echo "- File permissions (755 for dirs, 644 for files)"
echo "- Database connection in api/.env"
echo "- PHP version (7.4+ required)"
