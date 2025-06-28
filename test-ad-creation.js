const https = require('https');
const http = require('http');

const API_URL = 'http://localhost:5000/api';

// Simple fetch replacement for Node.js with timeout
function fetchData(url, options = {}) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout (10s)'));
    }, 10000);

    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 10000
    };

    const req = client.request(requestOptions, (res) => {
      clearTimeout(timeout);
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            json: () => Promise.resolve(jsonData),
            data: jsonData  // Add raw data for debugging
          });
        } catch (error) {
          resolve({
            ok: false,
            statusCode: res.statusCode,
            json: () => Promise.resolve({ message: data }),
            data: data,  // Add raw data for debugging
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    req.on('timeout', () => {
      clearTimeout(timeout);
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test user registration and ad creation
async function testAdCreation() {
  try {
    console.log('🔥 Testing Ad Creation...\n');

    // Try to create a user directly in the database for testing
    console.log('1. Creating a direct login attempt...');
    
    // Let's try to login with the provided credentials
    const loginResponse = await fetchData(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'hamzasheikh1228@gmail.com',
        password: 'Hello12@'
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login response status:', loginResponse.statusCode);
    console.log('Login response:', loginData);
    
    if (loginResponse.data && typeof loginResponse.data === 'string') {
      console.log('Raw response data:', loginResponse.data);
    }

    let token;
    
    if (!loginResponse.ok) {
      console.log('Login failed, trying to register and verify...');
      
      // Register a user
      const email = `test_${Date.now()}@example.com`;
      const registerResponse = await fetchData(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser_' + Date.now(),
          email: email,
          password: 'password123'
        }),
      });

      const registerData = await registerResponse.json();
      console.log('Register response:', registerData);

      if (!registerResponse.ok) {
        throw new Error(`Registration failed: ${registerData.message}`);
      }

      // Since we can't easily verify email in this test, let's skip ad creation for now
      console.log('✅ User registered! Email verification required for ad creation.');
      console.log('ℹ️  To test ad creation, manually verify email and create ads through the UI.');
      return;
    } else {
      token = loginData.token;
      console.log('✅ Login successful!\n');
    }

    // 2. Create a test ad
    console.log('2. Creating test ad...');
    const adData = {
      title: 'Test Gaming YouTube Channel',
      channelUrl: 'https://youtube.com/test-gaming-channel',
      platform: 'youtube',
      category: 'Gaming',
      contentType: 'Unique content',
      contentCategory: 'Gaming Reviews',
      description: 'A great gaming channel with consistent uploads and high engagement.',
      price: 5000,
      subscribers: 25000,
      monthlyIncome: 800,
      isMonetized: true,
      incomeDetails: 'AdSense revenue and sponsorships',
      promotionDetails: 'Social media promotion and SEO optimization'
    };

    const adResponse = await fetchData(`${API_URL}/ads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(adData),
    });

    const adResult = await adResponse.json();
    console.log('Ad creation response status:', adResponse.statusCode);
    console.log('Ad creation response:', adResult);
    
    if (adResponse.data && typeof adResponse.data === 'string') {
      console.log('Raw ad creation response data:', adResponse.data);
    }

    if (!adResponse.ok) {
      console.error(`❌ Ad creation failed with status ${adResponse.statusCode}`);
      console.error('Error details:', adResult);
      throw new Error(`Ad creation failed: ${adResult.message || 'Unknown error'}`);
    }

    console.log('✅ Ad created successfully!\n');

    // 3. Fetch all ads to confirm it's there
    console.log('3. Fetching all ads...');
    const adsResponse = await fetchData(`${API_URL}/ads`);
    const adsData = await adsResponse.json();
    
    console.log('All ads:', JSON.stringify(adsData, null, 2));
    console.log(`\n✅ Test completed! Found ${adsData.ads.length} ads in database.`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdCreation();
