const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_URL = 'http://localhost:5000/api';

async function testAdCreation() {
  try {
    // First login to get a token
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'hamzasheikh1228@gmail.com',
        password: 'Hello12@'
      })
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      throw new Error(`Login failed: ${errorData.message}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');

    // Test case 1: Valid contentType
    console.log('\n🧪 Test 1: Valid contentType');
    const validAdData = {
      title: 'Test Channel with Valid ContentType',
      channelUrl: 'https://youtube.com/channel/test123',
      platform: 'youtube',
      category: 'Cars & Bikes',
      contentType: 'Unique content', // Valid ENUM value
      contentCategory: 'Cars & Bikes',
      description: 'Test description',
      price: 100,
      subscribers: 1000,
      monthlyIncome: 50,
      isMonetized: true,
      incomeDetails: 'Ad revenue',
      promotionDetails: 'Social media marketing',
      screenshots: [],
      tags: []
    };

    const validResponse = await fetch(`${API_URL}/ads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(validAdData)
    });

    if (validResponse.ok) {
      const result = await validResponse.json();
      console.log('✅ Valid contentType test passed:', result.message);
    } else {
      const errorData = await validResponse.json();
      console.log('❌ Valid contentType test failed:', errorData.message);
    }

    // Test case 2: Empty string contentType (problematic case)
    console.log('\n🧪 Test 2: Empty string contentType');
    const emptyStringAdData = {
      title: 'Test Channel with Empty ContentType',
      channelUrl: 'https://youtube.com/channel/test456',
      platform: 'youtube',
      category: 'Cars & Bikes',
      contentType: '', // Empty string - this should cause the error
      contentCategory: 'Cars & Bikes',
      description: 'Test description',
      price: 100,
      subscribers: 1000,
      monthlyIncome: 50,
      isMonetized: true,
      incomeDetails: 'Ad revenue',
      promotionDetails: 'Social media marketing',
      screenshots: [],
      tags: []
    };

    const emptyStringResponse = await fetch(`${API_URL}/ads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(emptyStringAdData)
    });

    if (emptyStringResponse.ok) {
      const result = await emptyStringResponse.json();
      console.log('✅ Empty string contentType test passed (unexpected):', result.message);
    } else {
      const errorData = await emptyStringResponse.json();
      console.log('❌ Empty string contentType test failed (expected):', errorData.message);
    }

    // Test case 3: null contentType (should work)
    console.log('\n🧪 Test 3: null contentType');
    const nullAdData = {
      title: 'Test Channel with Null ContentType',
      channelUrl: 'https://youtube.com/channel/test789',
      platform: 'youtube',
      category: 'Cars & Bikes',
      contentType: null, // null value - this should work
      contentCategory: 'Cars & Bikes',
      description: 'Test description',
      price: 100,
      subscribers: 1000,
      monthlyIncome: 50,
      isMonetized: true,
      incomeDetails: 'Ad revenue',
      promotionDetails: 'Social media marketing',
      screenshots: [],
      tags: []
    };

    const nullResponse = await fetch(`${API_URL}/ads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(nullAdData)
    });

    if (nullResponse.ok) {
      const result = await nullResponse.json();
      console.log('✅ null contentType test passed:', result.message);
    } else {
      const errorData = await nullResponse.json();
      console.log('❌ null contentType test failed:', errorData.message);
    }

    // Test case 4: Simulating what frontend might send
    console.log('\n🧪 Test 4: Frontend simulation with || null logic');
    const frontendAdData = {
      title: 'Test Channel Frontend Simulation',
      channelUrl: 'https://youtube.com/channel/test999',
      platform: 'youtube',
      category: 'Cars & Bikes',
      contentType: '' || null, // This should resolve to null
      contentCategory: 'Cars & Bikes' || null,
      description: 'Test description' || '',
      price: parseFloat('100') || 0,
      subscribers: parseInt('1000') || 0,
      monthlyIncome: parseFloat('50') || 0,
      isMonetized: Boolean(true),
      incomeDetails: 'Ad revenue' || '',
      promotionDetails: 'Social media marketing' || '',
      screenshots: [],
      tags: []
    };

    console.log('Processed frontend data:', JSON.stringify(frontendAdData, null, 2));

    const frontendResponse = await fetch(`${API_URL}/ads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(frontendAdData)
    });

    if (frontendResponse.ok) {
      const result = await frontendResponse.json();
      console.log('✅ Frontend simulation test passed:', result.message);
    } else {
      const errorData = await frontendResponse.json();
      console.log('❌ Frontend simulation test failed:', errorData.message);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAdCreation();
