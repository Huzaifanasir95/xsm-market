const https = require('https');
const http = require('http');

const API_URL = 'http://localhost:5000';

// Simple fetch replacement for Node.js
function fetchData(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            json: () => Promise.resolve(jsonData)
          });
        } catch (e) {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            text: () => Promise.resolve(data),
            json: () => Promise.reject(new Error('Invalid JSON'))
          });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testListingsEndpoint() {
  try {
    console.log('🧪 Testing /user/listings endpoint...');
    
    // First, login to get a token
    console.log('\n1. Logging in...');
    const loginResponse = await fetchData(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'huzaifanasir111',
        password: 'Test123!'
      })
    });

    const loginResult = await loginResponse.json();
    console.log('Login status:', loginResponse.statusCode);
    
    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginResult);
      return;
    }

    const token = loginResult.token;
    console.log('✅ Login successful, token obtained');

    // Test the new /user/listings endpoint
    console.log('\n2. Testing /user/listings endpoint...');
    const listingsResponse = await fetchData(`${API_URL}/user/listings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Listings endpoint status:', listingsResponse.statusCode);
    const listingsResult = await listingsResponse.json();
    console.log('Listings response:', JSON.stringify(listingsResult, null, 2));

    if (listingsResponse.ok) {
      console.log('✅ /user/listings endpoint works!');
      console.log(`Found ${listingsResult.listings ? listingsResult.listings.length : 0} listings`);
    } else {
      console.error('❌ /user/listings endpoint failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testListingsEndpoint();
