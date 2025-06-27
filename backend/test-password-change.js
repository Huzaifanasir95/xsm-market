// Test script for password change functionality
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testPasswordChange() {
  console.log('🧪 Testing Password Change Functionality...\n');
  
  try {
    // Test 1: Create a Google user
    console.log('1. Creating a Google user...');
    const googleUserData = {
      username: 'googleuser123',
      fullName: 'Google Test User',
      email: 'googleuser@test.com',
      googleId: 'google_12345',
      authProvider: 'google'
    };
    
    const registerResponse = await axios.post(`${API_URL}/auth/google-signin`, {
      token: 'mock_google_token',
      user: googleUserData
    }).catch(err => {
      if (err.response?.data?.message?.includes('already exists')) {
        console.log('   ✅ User already exists, logging in...');
        return null;
      }
      throw err;
    });
    
    // Get or create user token
    let userToken;
    if (registerResponse) {
      userToken = registerResponse.data.token;
      console.log('   ✅ Google user created successfully');
    } else {
      // Login with existing user
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: 'googleuser@test.com',
        password: 'testpassword123' // This might fail if no password set
      }).catch(() => null);
      
      if (!loginResponse) {
        console.log('   ⚠️ Cannot login - user exists but has no password (expected for Google user)');
        // For testing, we'll skip this test
        return;
      }
      userToken = loginResponse.data.token;
    }
    
    if (!userToken) {
      console.log('   ❌ Failed to get user token');
      return;
    }
    
    // Test 2: Set password for Google user
    console.log('\n2. Setting password for Google user...');
    const passwordResponse = await axios.put(`${API_URL}/user/password`, {
      currentPassword: '', // Empty for Google users
      newPassword: 'newpassword123'
    }, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   ✅ Password set successfully:', passwordResponse.data.message);
    
    // Test 3: Try to login with email/password
    console.log('\n3. Testing login with new password...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'googleuser@test.com',
      password: 'newpassword123'
    });
    
    console.log('   ✅ Login with email/password successful!');
    
    // Test 4: Change password (now requires current password)
    console.log('\n4. Changing password (now requires current password)...');
    const changeResponse = await axios.put(`${API_URL}/user/password`, {
      currentPassword: 'newpassword123',
      newPassword: 'updatedpassword123'
    }, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   ✅ Password changed successfully:', changeResponse.data.message);
    
    console.log('\n🎉 All password change tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  testPasswordChange();
}

module.exports = { testPasswordChange };
