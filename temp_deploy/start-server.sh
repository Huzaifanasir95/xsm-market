#!/bin/bash

# Start PHP Backend Server on localhost:5000
echo "🚀 Starting PHP Backend Server on localhost:5000..."
echo "📁 Working directory: $(pwd)"
echo "🔧 PHP version: $(php --version | head -n 1)"
echo ""

# Kill any existing PHP server on port 5000
echo "🔄 Checking for existing servers on port 5000..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

# Start the PHP built-in server
echo "▶️  Starting PHP server..."
php -S localhost:5000 server.php

echo ""
echo "✅ Server started successfully!"
echo "🌐 Backend API: http://localhost:5000"
echo "🔍 Health check: http://localhost:5000/health"
echo ""
echo "📋 Available endpoints:"
echo "   • Authentication: http://localhost:5000/auth/*"
echo "   • Users: http://localhost:5000/user/*"
echo "   • Ads: http://localhost:5000/ads/*"
echo "   • Chat: http://localhost:5000/chat/*"
echo "   • Admin: http://localhost:5000/admin/*"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
