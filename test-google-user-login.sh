#!/bin/bash

echo "🧪 Testing Google user password set and login flow..."

API_BASE="http://localhost:8001/api"

echo ""
echo "📧 Step 1: Create a Google user (simulate Google OAuth registration)"
echo "POST $API_BASE/auth/google"

# Note: In a real test, we'd need to simulate the Google OAuth flow
# For now, we'll assume a Google user exists with email: google-test@example.com

echo ""
echo "🔑 Step 2: Set password for Google user"
echo "POST $API_BASE/user/change-password"

# This would require authentication token
echo '{
  "newPassword": "newpassword123"
}'

echo ""
echo "🔐 Step 3: Login with email/password (should work now)"
echo "POST $API_BASE/auth/login"

curl -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "google-test@example.com",
    "password": "newpassword123"
  }' \
  -v

echo ""
echo "✅ Test completed!"
