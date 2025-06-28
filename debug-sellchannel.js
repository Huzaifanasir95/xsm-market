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

async function debugSellChannel() {
  try {
    console.log('🔍 Debugging SellChannel functionality...\n');

    // 1. Login with your credentials
    console.log('1. Logging in with your credentials...');
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

    // 2. Try to create an ad exactly like the SellChannel form would
    console.log('2. Creating ad like SellChannel form...');
    const adData = {
      title: 'Test Channel from SellChannel Form',
      channelUrl: 'https://www.youtube.com/channel/test123',
      platform: 'youtube',
      category: 'Gaming',
      contentType: 'Unique content',
      contentCategory: 'Gaming Reviews',
      description: 'This is a test channel created from the SellChannel form debug script.',
      price: 1500,
      subscribers: 10000,
      monthlyIncome: 500,
      isMonetized: true,
      incomeDetails: 'YouTube AdSense and sponsorships',
      promotionDetails: 'Social media and SEO'
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

    console.log('✅ Ad created successfully from debug script!');

    // Wait a moment for the database to update
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Verify it appears in the ads list
    console.log('\n3. Fetching all ads to verify...');
    const adsResponse = await fetchData(`${API_URL}/ads`);
    const adsData = await adsResponse.json();
    
    console.log(`Found ${adsData.ads.length} ads total`);
    const newAd = adsData.ads.find(ad => ad.title === adData.title);
    if (newAd) {
      console.log('✅ New ad found in list:', {
        id: newAd.id,
        title: newAd.title,
        price: newAd.price,
        status: newAd.status
      });
    } else {
      console.log('❌ New ad not found in list');
    }

    // 4. Test the problematic case - frontend sending empty strings
    console.log('\n4. Testing frontend edge case with empty strings...');
    const problematicAdData = {
      title: 'sasaas', // Exact title from the error
      channelUrl: 'https://youtube.com/@UCX6OQ3DkcsbYNE6H8uQQuVA', // Exact URL from error
      platform: 'youtube',
      category: 'Cars & Bikes', // Exact category from error
      contentType: '', // Empty string - this causes the error!
      contentCategory: '', // Empty string
      description: '', // Empty string
      price: 212121, // Exact price from error
      subscribers: 1, // Exact value from error
      monthlyIncome: 0, // Exact value from error
      isMonetized: false, // Exact value from error
      incomeDetails: '', // Empty string
      promotionDetails: '', // Empty string
      screenshots: [], // Empty array
      tags: [] // Empty array
    };

    console.log('Sending problematic ad data (mimics frontend error):', JSON.stringify(problematicAdData, null, 2));

    const problematicResponse = await fetchData(`${API_URL}/ads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(problematicAdData)
    });

    console.log('Problematic ad creation status:', problematicResponse.statusCode);
    const problematicResult = await problematicResponse.json();
    console.log('Problematic ad creation response:', problematicResult);

    if (!problematicResponse.ok) {
      console.log('❌ Expected failure - empty string contentType causes error');
    } else {
      console.log('✅ Unexpected success - empty string was handled?');
    }

    // 5. Test the fix - converting empty strings to null
    console.log('\n5. Testing the fix - converting empty strings to null...');
    const fixedAdData = {
      title: 'sasaas Fixed', 
      channelUrl: 'https://youtube.com/@UCX6OQ3DkcsbYNE6H8uQQuVA',
      platform: 'youtube',
      category: 'Cars & Bikes',
      contentType: problematicAdData.contentType || null, // Empty string becomes null
      contentCategory: problematicAdData.contentCategory || null, // Empty string becomes null
      description: problematicAdData.description || '',
      price: problematicAdData.price || 0,
      subscribers: problematicAdData.subscribers || 0,
      monthlyIncome: problematicAdData.monthlyIncome || 0,
      isMonetized: Boolean(problematicAdData.isMonetized),
      incomeDetails: problematicAdData.incomeDetails || '',
      promotionDetails: problematicAdData.promotionDetails || '',
      screenshots: problematicAdData.screenshots || [],
      tags: problematicAdData.tags || []
    };

    console.log('Sending fixed ad data (empty strings -> null):', JSON.stringify(fixedAdData, null, 2));

    const fixedResponse = await fetchData(`${API_URL}/ads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(fixedAdData)
    });

    console.log('Fixed ad creation status:', fixedResponse.statusCode);
    const fixedResult = await fixedResponse.json();
    console.log('Fixed ad creation response:', fixedResult);

    if (fixedResponse.ok) {
      console.log('✅ Fix successful - null values work correctly!');
    } else {
      console.log('❌ Fix failed - there might be another issue');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Full error:', error);
  }
}

debugSellChannel();