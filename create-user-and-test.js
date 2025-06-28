const https = require('https');
const http = require('http');

const API_URL = 'http://localhost:5000/api';

// Simple fetch replacement for Node.js
function fetchData(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            status: res.statusCode,
            json: () => Promise.resolve(jsonData),
            text: () => Promise.resolve(data)
          });
        } catch (error) {
          resolve({
            ok: false,
            statusCode: res.statusCode,
            status: res.statusCode,
            json: () => Promise.resolve({ message: data }),
            text: () => Promise.resolve(data)
          });
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function createUserAndTestAd() {
  try {
    console.log('🔄 Creating user and testing ad creation...\n');

    // 1. Register user with your credentials
    console.log('1. Registering user with your credentials...');
    const registerResponse = await fetchData(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'hamzasheikh',
        email: 'hamzasheikh1228@gmail.com',
        password: 'Hello12@',
        fullName: 'Hamza Sheikh'
      }),
    });

    console.log('Register status:', registerResponse.statusCode);
    const registerData = await registerResponse.json();
    console.log('Register response:', registerData);

    if (!registerResponse.ok && registerData.message && !registerData.message.includes('already exists')) {
      throw new Error(`Registration failed: ${registerData.message}`);
    }

    console.log('✅ User registration completed!\n');

    // 2. Login with your credentials
    console.log('2. Logging in...');
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

    console.log('Login status:', loginResponse.statusCode);
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginData.message}`);
    }

    const token = loginData.token;
    console.log('✅ Login successful!\n');

    // 3. Create a test ad
    console.log('3. Creating test ad...');
    const adData = {
      title: 'My Awesome Gaming Channel',
      channelUrl: 'https://www.youtube.com/channel/test123',
      platform: 'youtube',
      category: 'Gaming',
      contentType: 'Unique content',
      contentCategory: 'Gaming Reviews',
      description: 'This is a test gaming channel with great content and engagement.',
      price: 2500,
      subscribers: 15000,
      monthlyIncome: 600,
      isMonetized: true,
      incomeDetails: 'YouTube AdSense and brand sponsorships',
      promotionDetails: 'Social media marketing and SEO optimization'
    };

    console.log('Sending ad data:', JSON.stringify(adData, null, 2));

    const adResponse = await fetchData(`${API_URL}/ads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(adData)
    });

    console.log('Ad creation status:', adResponse.statusCode);
    const adResult = await adResponse.json();
    console.log('Ad creation response:', adResult);

    if (!adResponse.ok) {
      console.error('❌ Ad creation failed');
      console.error('Status:', adResponse.statusCode);
      console.error('Response:', adResult);
      throw new Error(`Ad creation failed: ${adResult.message || 'Unknown error'}`);
    }

    console.log('✅ Ad created successfully!');

    // 4. Verify it appears in the ads list
    console.log('\n4. Fetching all ads to verify...');
    const adsResponse = await fetchData(`${API_URL}/ads`);
    const adsData = await adsResponse.json();
    
    console.log(`Found ${adsData.ads ? adsData.ads.length : 0} ads total`);
    if (adsData.ads && adsData.ads.length > 0) {
      console.log('✅ Ads are showing up in the marketplace!');
      adsData.ads.forEach((ad, index) => {
        console.log(`Ad ${index + 1}:`, {
          id: ad.id,
          title: ad.title,
          price: ad.price,
          status: ad.status,
          platform: ad.platform
        });
      });
    } else {
      console.log('❌ No ads found in the marketplace');
    }

    console.log('\n🎉 Test completed successfully! Your ad should now be visible on the frontend homepage.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

createUserAndTestAd();
