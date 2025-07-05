require('dotenv').config();
const axios = require('axios');

async function testSocialBlade() {
  try {
    const clientId = process.env.SOCIALBLADE_CLIENT_ID;
    const token = process.env.SOCIALBLADE_TOKEN;
    
    console.log('🔑 Credentials:');
    console.log('Client ID:', clientId);
    console.log('Token:', token);
    
    if (!clientId || !token) {
      console.log('❌ Missing credentials');
      return;
    }
    
    const username = 'MrBeast';
    const platform = 'youtube';
    const apiUrl = `https://matrix.sbapis.com/b/${platform}/statistics`;
    
    console.log(`\n📡 Making request to: ${apiUrl}`);
    console.log('📋 Parameters:', { query: username, history: 'default', 'allow-stale': false });
    console.log('🔐 Headers:', { clientid: clientId, token: token });
    
    const response = await axios.get(apiUrl, {
      params: {
        query: username,
        history: 'default',
        'allow-stale': false
      },
      headers: {
        'clientid': clientId,
        'token': token,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('\n✅ Success!');
    console.log('Status:', response.status);
    console.log('Success:', response.data?.status?.success);
    console.log('Channel:', response.data?.data?.id?.display_name);
    console.log('Subscribers:', response.data?.data?.statistics?.total?.subscribers);
    console.log('Credits remaining:', response.data?.info?.credits?.available);
    
  } catch (error) {
    console.log('\n❌ Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Status Text:', error.response.statusText);
      console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testSocialBlade();
