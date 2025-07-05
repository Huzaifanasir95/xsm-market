#!/usr/bin/env node

const API_BASE = 'http://localhost:8001/api';

async function testContactAPI() {
  console.log('🧪 Testing Contact API...');
  
  try {
    // Test 1: Check contact service status
    console.log('\n📊 Test 1: Check contact service status');
    const statusResponse = await fetch(`${API_BASE}/contact/status`);
    const statusData = await statusResponse.json();
    
    console.log('Status response:', JSON.stringify(statusData, null, 2));
    
    if (statusData.available) {
      console.log('✅ Contact service is available');
    } else {
      console.log('⚠️ Contact service is not available');
    }
    
    // Test 2: Submit contact form
    console.log('\n📧 Test 2: Submit contact form');
    
    const contactData = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Contact Form',
      category: 'Technical Support',
      message: 'This is a test message to verify the contact form functionality is working correctly.'
    };
    
    const submitResponse = await fetch(`${API_BASE}/contact/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData)
    });
    
    const submitData = await submitResponse.json();
    
    console.log('Submit response:', JSON.stringify(submitData, null, 2));
    
    if (submitResponse.ok && submitData.success) {
      console.log('✅ Contact form submitted successfully');
    } else {
      console.log('❌ Contact form submission failed:', submitData.message);
    }
    
    // Test 3: Test validation errors
    console.log('\n🔍 Test 3: Test validation (should fail)');
    
    const invalidData = {
      name: '',
      email: 'invalid-email',
      subject: '',
      category: 'Invalid Category',
      message: 'Short'
    };
    
    const validationResponse = await fetch(`${API_BASE}/contact/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData)
    });
    
    const validationData = await validationResponse.json();
    
    if (!validationResponse.ok) {
      console.log('✅ Validation working correctly:', validationData.message);
    } else {
      console.log('❌ Validation failed - should have rejected invalid data');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Check if server is running first
fetch(`${API_BASE}/../`)
  .then(() => {
    console.log('✅ Server is running');
    testContactAPI();
  })
  .catch(() => {
    console.log('❌ Server not running. Start it with: cd php-backend && php -S localhost:8001');
  });
