const axios = require('axios');
require('dotenv').config();

// Test Social Blade API integration
const testSocialBladeAPI = async () => {
  console.log('🧪 Testing Social Blade API Integration\n');

  const clientId = process.env.SOCIALBLADE_CLIENT_ID;
  const token = process.env.SOCIALBLADE_TOKEN;

  if (!clientId || !token) {
    console.log('❌ Social Blade credentials not found in .env file');
    console.log('📝 Please add your credentials to backend/.env:');
    console.log('   SOCIALBLADE_CLIENT_ID=your_client_id_here');
    console.log('   SOCIALBLADE_TOKEN=your_token_here');
    console.log('🔗 Get credentials from: https://socialblade.com/api');
    return;
  }

  console.log('✅ Social Blade credentials found');
  console.log(`   Client ID: ${clientId.substring(0, 8)}...`);
  console.log(`   Token: ${token.substring(0, 8)}...\n`);

  // Test with different platforms and usernames
  const testCases = [
    { platform: 'youtube', username: 'PewDiePie' },
    { platform: 'instagram', username: 'cristiano' },
    { platform: 'tiktok', username: 'charlidamelio' },
    { platform: 'twitter', username: 'elonmusk' },
  ];

  for (const { platform, username } of testCases) {
    console.log(`🔍 Testing ${platform}/${username}...`);
    
    try {
      // Note: This is the expected Social Blade API structure
      // Actual API structure may vary - adjust the URL format as needed
      const apiUrl = `https://api.socialblade.com/v2/${platform}/user/${username}`;
      
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Client-ID': clientId,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data && response.data.user) {
        const user = response.data.user;
        console.log(`   ✅ Success: ${user.displayName || user.username}`);
        console.log(`   👥 Followers: ${user.followers || user.subscribers || 'N/A'}`);
        console.log(`   🖼️  Profile Pic: ${user.avatar ? 'Available' : 'N/A'}`);
      } else {
        console.log(`   ⚠️  Unexpected response format`);
      }
    } catch (error) {
      if (error.response) {
        console.log(`   ❌ API Error: ${error.response.status} - ${error.response.statusText}`);
        if (error.response.data) {
          console.log(`   📝 Response: ${JSON.stringify(error.response.data)}`);
        }
      } else {
        console.log(`   ❌ Network Error: ${error.message}`);
      }
    }
    
    console.log(''); // Empty line for readability
  }

  console.log('📋 Next Steps:');
  console.log('1. If you see authentication errors, verify your API credentials');
  console.log('2. If the API structure is different, update the extraction logic');
  console.log('3. Check Social Blade documentation for correct endpoint format');
  console.log('4. Consider rate limiting and API quotas');
};

// Test the main social media extraction endpoint
const testExtractionEndpoint = async () => {
  console.log('\n🔗 Testing Social Media Extraction Endpoint...\n');

  const testUrls = [
    'https://www.youtube.com/c/PewDiePie',
    'https://www.instagram.com/cristiano/',
    'https://www.tiktok.com/@charlidamelio',
    'https://twitter.com/elonmusk',
  ];

  for (const url of testUrls) {
    console.log(`Testing: ${url}`);
    try {
      const response = await axios.post('http://localhost:5000/api/social-media/extract-profile', {
        url: url
      });

      if (response.data.success) {
        const data = response.data.data;
        console.log(`   ✅ Title: ${data.title}`);
        console.log(`   👥 Followers: ${data.followers}`);
        console.log(`   🖼️  Profile Pic: ${data.profilePicture ? 'Available' : 'N/A'}`);
        console.log(`   📊 Source: ${data.source}`);
      } else {
        console.log(`   ❌ Extraction failed`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  }
};

// Run tests
const runTests = async () => {
  await testSocialBladeAPI();
  
  console.log('\n' + '='.repeat(50));
  console.log('💡 To test the extraction endpoint, start your server first:');
  console.log('   cd backend && npm start');
  console.log('Then run: node test-social-blade-integration.js endpoint');
};

// Check if we should test the endpoint
if (process.argv.includes('endpoint')) {
  testExtractionEndpoint();
} else {
  runTests();
}
