#!/bin/bash

echo "🧹 XSM Market Project Cleanup"
echo "============================="

# Function to safely remove files/directories
safe_remove() {
    if [ -e "$1" ]; then
        echo "🗑️  Removing: $1"
        rm -rf "$1"
    fi
}

# Function to count files in directory
count_files() {
    if [ -d "$1" ]; then
        find "$1" -type f | wc -l | tr -d ' '
    else
        echo "0"
    fi
}

echo "📊 Current project size:"
du -sh . 2>/dev/null || echo "Unable to calculate size"

echo ""
echo "🔍 Scanning for unnecessary files..."

# Remove common unnecessary files
echo ""
echo "🗑️  Removing development artifacts..."

# Node modules (will be reinstalled)
safe_remove "node_modules"
safe_remove "backend/node_modules"

# Build artifacts
safe_remove "dist"
safe_remove "build"
safe_remove ".next"
safe_remove ".nuxt"

# Cache files
safe_remove ".cache"
safe_remove ".parcel-cache"
safe_remove ".vite"
safe_remove "backend/.cache"

# Log files
safe_remove "*.log"
safe_remove "logs"
safe_remove "backend/*.log"
safe_remove "backend/logs"

# Temporary files
safe_remove ".tmp"
safe_remove "tmp"
safe_remove "temp"
safe_remove ".temp"

# OS generated files
safe_remove ".DS_Store"
safe_remove "Thumbs.db"
safe_remove "desktop.ini"
find . -name ".DS_Store" -delete 2>/dev/null
find . -name "Thumbs.db" -delete 2>/dev/null

# IDE files
safe_remove ".vscode/settings.json"
safe_remove ".idea"
safe_remove "*.swp"
safe_remove "*.swo"
safe_remove "*~"

# Test coverage
safe_remove "coverage"
safe_remove ".nyc_output"
safe_remove "backend/coverage"

# Package manager lock files (keep one)
if [ -f "package-lock.json" ] && [ -f "yarn.lock" ]; then
    safe_remove "yarn.lock"
    echo "   Kept package-lock.json, removed yarn.lock"
fi

# Remove test and example files
echo ""
echo "🧪 Removing test/debug files..."

safe_remove "test-*.js"
safe_remove "backend/test-*.js"
safe_remove "*.test.js"
safe_remove "*.spec.js"
safe_remove "__tests__"
safe_remove "backend/__tests__"

# Remove example/sample files
safe_remove "*example*"
safe_remove "*sample*"
safe_remove "*demo*"
safe_remove "backend/*example*"
safe_remove "backend/*sample*"
safe_remove "backend/*demo*"

# Remove debug files
safe_remove "debug.log"
safe_remove "backend/debug.log"
safe_remove "npm-debug.log*"
safe_remove "yarn-debug.log*"
safe_remove "yarn-error.log*"

# Remove documentation build files
safe_remove "docs/build"
safe_remove "docs/dist"

# Clean up environment files (keep production)
echo ""
echo "🔧 Cleaning environment files..."

# List all .env files
echo "📄 Environment files found:"
find . -name ".env*" -type f | while read file; do
    echo "   $file"
done

# Remove development-specific env files
safe_remove ".env.local"
safe_remove ".env.development"
safe_remove ".env.test"
safe_remove "backend/.env.local"
safe_remove "backend/.env.development"
safe_remove "backend/.env.test"

echo "   ✅ Kept production environment files"

# Remove backup and temporary files
echo ""
echo "📦 Removing backup/temporary files..."

safe_remove "*.bak"
safe_remove "*.backup"
safe_remove "*.orig"
safe_remove "*.tmp"
safe_remove "*~"

# Clean up git artifacts (but keep .git)
safe_remove ".git/hooks/pre-commit.sample"
safe_remove ".git/hooks/pre-push.sample"
safe_remove ".git/logs" # Git logs can be regenerated

# Remove large binary files that might be accidentally committed
echo ""
echo "🔍 Checking for large files..."

find . -type f -size +10M 2>/dev/null | while read file; do
    if [[ ! "$file" == *"node_modules"* ]] && [[ ! "$file" == *".git"* ]]; then
        echo "⚠️  Large file found: $file ($(du -h "$file" | cut -f1))"
        echo "   Consider removing if not needed"
    fi
done

# Clean up any deployment artifacts
echo ""
echo "🚀 Removing old deployment files..."

safe_remove "*.zip"
safe_remove "*.tar.gz"
safe_remove "deploy"
safe_remove "deployment"
safe_remove "*deploy*"

# Keep our new deployment script
if [ ! -f "create-deploy-zip.sh" ]; then
    echo "   ✅ Deployment script preserved"
fi

# Check for duplicate files
echo ""
echo "🔍 Checking for potential duplicates..."

# Check for multiple package.json files
package_count=$(find . -name "package.json" -not -path "./node_modules/*" | wc -l | tr -d ' ')
if [ "$package_count" -gt 2 ]; then
    echo "⚠️  Multiple package.json files found:"
    find . -name "package.json" -not -path "./node_modules/*"
fi

# Summary
echo ""
echo "✅ Cleanup Complete!"
echo "==================="
echo ""
echo "📊 New project size:"
du -sh . 2>/dev/null || echo "Unable to calculate size"

echo ""
echo "📋 Remaining important files:"
echo "   ✅ Source code (src/)"
echo "   ✅ Backend code (backend/)"
echo "   ✅ Package configurations"
echo "   ✅ Production environment files"
echo "   ✅ README and documentation"
echo "   ✅ Deployment scripts"

echo ""
echo "🔄 Next steps:"
echo "   1. Run 'npm install' to reinstall dependencies"
echo "   2. Run database cleanup: 'node backend/cleanup-database.js'"
echo "   3. Test your application locally"
echo "   4. Create new deployment package if needed"

echo ""
echo "🎉 Project cleaned successfully!"
