const fs = require('fs');
const FormData = require('form-data');
const https = require('https');

// Test image upload endpoint
async function testImageUpload() {
  try {
    // First get the token by logging in
    const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.error('Login failed:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('Login successful, token:', token ? 'received' : 'missing');

    // Get the first chat for testing
    const chatsResponse = await fetch('http://localhost:8000/api/chat/chats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!chatsResponse.ok) {
      console.error('Failed to get chats:', await chatsResponse.text());
      return;
    }

    const chats = await chatsResponse.json();
    if (chats.length === 0) {
      console.error('No chats available for testing');
      return;
    }

    const chatId = chats[0].id;
    console.log('Testing with chat ID:', chatId);

    // Test the image upload endpoint with a mock file
    const formData = new FormData();
    
    // Create a simple test image data (1x1 PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    formData.append('file', testImageBuffer, { filename: 'test.png', contentType: 'image/png' });
    formData.append('messageType', 'image');

    console.log('Uploading test image...');
    const uploadResponse = await fetch(`http://localhost:8000/api/chat/chats/${chatId}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    console.log('Upload response status:', uploadResponse.status);
    const responseText = await uploadResponse.text();
    console.log('Upload response:', responseText);

    if (uploadResponse.ok) {
      console.log('✅ Image upload test successful!');
    } else {
      console.log('❌ Image upload test failed!');
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

// Use global fetch if available, otherwise require node-fetch
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

testImageUpload();
