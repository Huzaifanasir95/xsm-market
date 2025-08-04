#!/bin/bash

# XSM Market Backend Diagnostic Script
echo "🔍 XSM Market Backend Diagnostics"
echo "================================="

# Check if we're in the right directory
if [ ! -f "index.php" ]; then
    echo "❌ Error: Run this script from the /api directory"
    exit 1
fi

echo "📍 Current Directory: $(pwd)"
echo "🗂️  Files in API directory:"
ls -la | head -10

echo ""
echo "🔧 Checking PHP Configuration..."
if command -v php >/dev/null 2>&1; then
    echo "✅ PHP Version: $(php --version | head -n 1)"
else
    echo "❌ PHP not found"
fi

echo ""
echo "📊 Checking Environment File..."
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    echo "📝 Environment variables found:"
    grep -E "^[A-Z_]+" .env | head -5
else
    echo "❌ .env file missing!"
fi

echo ""
echo "🗄️  Checking Database Connection..."
if [ -f "test-db-connection.php" ]; then
    echo "🧪 Running database test..."
    php test-db-connection.php
else
    echo "⚠️  Database test file not found"
fi

echo ""
echo "🌐 Testing API Endpoint..."
if [ -f "test-api-status.php" ]; then
    echo "🧪 Running API test..."
    php test-api-status.php
else
    echo "⚠️  API test file not found"
fi

echo ""
echo "📁 Checking Critical Files..."
critical_files=("index.php" "config/database.php" "controllers/UserController.php" "models/User.php")

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing!"
    fi
done

echo ""
echo "🎯 Diagnosis Complete!"
echo "========================"
