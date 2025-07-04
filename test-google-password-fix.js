#!/usr/bin/env node

const API_BASE = 'http://localhost:8001/api';

async function testGoogleUserPasswordChange() {
  console.log('🧪 Testing Google user password change...');
  
  try {
    // This would require an actual Google user and auth token
    // For now, let's just test the login logic
    
    console.log('\n📝 Testing login after password change...');
    
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'google-user-test@example.com', // Replace with actual test user
        password: 'newpassword123'
      }),
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.user) {
      console.log('✅ Login successful! User data is present.');
      console.log('User ID:', data.user.id);
      console.log('Username:', data.user.username);
      console.log('Email:', data.user.email);
      console.log('AuthProvider:', data.user.authProvider);
    } else if (data.authProvider === 'google') {
      console.log('⚠️ User needs to set password first (expected if no password set)');
    } else {
      console.log('❌ Login failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Check if server is running first
fetch(`${API_BASE}/../`)
  .then(() => {
    console.log('✅ Server is running');
    testGoogleUserPasswordChange();
  })
  .catch(() => {
    console.log('❌ Server not running. Start it with: cd php-backend && php -S localhost:8001');
  });
