// Test frontend Google sign-in issue
console.log('🔍 Debugging frontend Google sign-in...');

// Check API URL configuration
const API_URL = 'http://localhost:5000/api';
console.log('📡 API URL:', API_URL);

// Test basic connectivity
async function testBasicConnectivity() {
  console.log('\n🌐 Testing basic connectivity...');
  
  try {
    const response = await fetch(`${API_URL}/auth/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Basic connectivity test result:', {
      status: response.status,
      statusText: response.statusText,
      headers: [...response.headers.entries()]
    });
    
    const data = await response.json();
    console.log('📋 Response data:', data);
  } catch (error) {
    console.error('❌ Basic connectivity test failed:', error);
  }
}

// Test Google sign-in endpoint with fake token
async function testGoogleSignInEndpoint() {
  console.log('\n🔐 Testing Google sign-in endpoint...');
  
  try {
    const response = await fetch(`${API_URL}/auth/google-signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'fake-token-for-testing'
      })
    });
    
    console.log('✅ Google sign-in endpoint test result:', {
      status: response.status,
      statusText: response.statusText,
      headers: [...response.headers.entries()]
    });
    
    const data = await response.json();
    console.log('📋 Response data:', data);
    
    // This should return 400 with "Invalid token" message, which is correct behavior
    if (response.status === 400 && data.message && data.message.includes('Invalid token')) {
      console.log('✅ Google sign-in endpoint is working correctly (rejects invalid tokens)');
    } else {
      console.log('⚠️ Unexpected response from Google sign-in endpoint');
    }
    
  } catch (error) {
    console.error('❌ Google sign-in endpoint test failed:', error);
    
    // Check specific error types
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.log('🔍 This is likely a "failed to fetch" error - network or CORS issue');
    }
  }
}

// Test CORS preflight
async function testCORSPreflight() {
  console.log('\n🔄 Testing CORS preflight...');
  
  try {
    const response = await fetch(`${API_URL}/auth/google-signin`, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('✅ CORS preflight test result:', {
      status: response.status,
      statusText: response.statusText,
      headers: [...response.headers.entries()]
    });
    
  } catch (error) {
    console.error('❌ CORS preflight test failed:', error);
  }
}

// Run all tests
async function runAllTests() {
  await testBasicConnectivity();
  await testGoogleSignInEndpoint();
  await testCORSPreflight();
  
  console.log('\n🎯 Summary:');
  console.log('- If all tests pass, the issue is likely with the actual Google token validation');
  console.log('- If basic connectivity fails, check if the backend server is running');
  console.log('- If CORS fails, check CORS configuration in the backend');
  console.log('- If only Google sign-in fails with "failed to fetch", it\'s likely a browser or HTTPS issue');
}

runAllTests();
