// Debug script to check admin status in browser console
// Copy and paste this into the browser console when logged in

console.log('🔍 Checking Admin Status...');

// Check localStorage data
const userData = localStorage.getItem('userData');
const token = localStorage.getItem('token');

console.log('📱 LocalStorage Data:');
console.log('  Token:', token ? 'Present' : 'Missing');
console.log('  User Data:', userData);

if (userData) {
  try {
    const user = JSON.parse(userData);
    console.log('👤 Parsed User Data:');
    console.log('  ID:', user.id);
    console.log('  Username:', user.username);
    console.log('  Email:', user.email);
    console.log('  isAdmin:', user.isAdmin);
    console.log('  Auth Provider:', user.authProvider);
    
    if (user.isAdmin === true) {
      console.log('✅ User has isAdmin flag set to true');
    } else {
      console.log('❌ User does not have isAdmin flag set to true');
      console.log('🔧 Suggestion: Re-login to get updated user data');
    }
  } catch (e) {
    console.error('❌ Error parsing user data:', e);
  }
} else {
  console.log('❌ No user data found in localStorage');
}

// Test admin API call
if (token) {
  console.log('🌐 Testing admin API call...');
  fetch('/api/admin/dashboard-stats', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('📡 API Response Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('📊 API Response Data:', data);
    if (data.message && data.message.includes('Admin access required')) {
      console.log('❌ Backend says: No admin access');
      console.log('🔧 Suggestion: Re-login as admin user');
    } else if (data.totalUsers !== undefined) {
      console.log('✅ Admin API working! Dashboard stats received');
    }
  })
  .catch(error => {
    console.error('❌ API call failed:', error);
  });
}
