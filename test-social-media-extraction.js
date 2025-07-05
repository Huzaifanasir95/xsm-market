const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';

async function testSocialMediaExtraction() {
  console.log('🧪 Testing Social Media Profile Extraction...\n');

  // Test URLs for different platforms
  const testUrls = [
    'https://youtube.com/channel/UCBJycsmduvYEL83R_U4JriQ', // YouTube channel
    'https://instagram.com/nike', // Instagram
    'https://tiktok.com/@charlidamelio', // TikTok
    'https://twitter.com/elonmusk', // Twitter
    'https://facebook.com/facebook' // Facebook
  ];

  for (const url of testUrls) {
    console.log(`\n🔍 Testing extraction for: ${url}`);
    
    try {
      const response = await fetch(`${API_URL}/social-media/extract-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Extraction successful:');
        console.log(`   Title: ${result.data.title}`);
        console.log(`   Platform: ${result.data.platform}`);
        console.log(`   Followers/Subscribers: ${result.data.followers || result.data.subscribers || 'N/A'}`);
        console.log(`   Profile Picture: ${result.data.profilePicture ? 'Available' : 'Not found'}`);
      } else {
        console.log('❌ Extraction failed:', result.message);
      }
    } catch (error) {
      console.log('❌ Request error:', error.message);
    }

    // Add delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n🎉 Social media extraction testing completed!');
}

// Test platform categories
async function testPlatformCategories() {
  console.log('\n🧪 Testing Platform Categories...\n');

  const platforms = ['youtube', 'instagram', 'tiktok', 'twitter', 'facebook'];

  for (const platform of platforms) {
    try {
      const response = await fetch(`${API_URL}/social-media/categories/${platform}`);
      const result = await response.json();
      
      console.log(`📱 ${platform.toUpperCase()} categories:`, result.categories.slice(0, 5).join(', ') + '...');
    } catch (error) {
      console.log(`❌ Error fetching categories for ${platform}:`, error.message);
    }
  }
}

async function runTests() {
  try {
    await testSocialMediaExtraction();
    await testPlatformCategories();
  } catch (error) {
    console.error('Test suite failed:', error);
  }
}

runTests();
