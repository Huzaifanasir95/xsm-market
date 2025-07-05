#!/usr/bin/env node

const API_BASE = 'http://localhost:8001/api';

async function testHybridUserLogin() {
  console.log('🧪 Testing hybrid user login...');
  
  // Step 1: Test login with a user that has authProvider = 'hybrid'
  console.log('\n🔐 Testing login for hybrid user...');
  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'hybrid-test@example.com',
        password: 'testpassword123'
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('User data:', JSON.stringify(data.user, null, 2));
      
      if (data.user) {
        console.log('✅ User data is present');
        console.log('AuthProvider:', data.user.authProvider);
      } else {
        console.log('❌ User data is missing!');
      }
    } else {
      console.log('❌ Login failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Check if server is running first
fetch(`${API_BASE}/../health`)
  .then(() => {
    console.log('✅ Server is running');
    testHybridUserLogin();
  })
  .catch(() => {
    console.log('❌ Server not running. Start it with: cd php-backend && php -S localhost:8001');
  });
