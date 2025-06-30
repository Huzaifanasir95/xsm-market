#!/bin/bash

echo "🔍 XSM Market - PM2 Diagnostic Script"
echo "====================================="
echo ""

echo "📊 PM2 Status:"
pm2 list

echo ""
echo "📝 Recent PM2 Logs for xsm-market-api:"
echo "─────────────────────────────────────"
pm2 logs xsm-market-api --lines 20

echo ""
echo "❌ Error Logs Only:"
echo "──────────────────"
pm2 logs xsm-market-api --err --lines 10

echo ""
echo "📁 Checking Critical Files:"
echo "──────────────────────────"
ls -la server.js package.json .env

echo ""
echo "🔧 Node.js Version:"
node --version

echo ""
echo "📦 NPM Packages Status:"
echo "──────────────────────"
npm list --depth=0

echo ""
echo "🌍 Environment Variables Check:"
echo "─────────────────────────────"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "DB_HOST: $DB_HOST"
echo "DB_NAME: $DB_NAME"

echo ""
echo "🚀 Manual Server Test:"
echo "─────────────────────"
echo "Attempting to start server manually..."
timeout 10s node server.js || echo "Server failed to start within 10 seconds"

echo ""
echo "📋 PM2 Process Details:"
echo "─────────────────────"
pm2 show xsm-market-api
