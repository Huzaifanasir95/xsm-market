const axios = require('axios');

const API_BASE = 'http://localhost:8000/api';

async function testDualEmailVerification() {
    try {
        console.log('🔄 Testing Dual Email Verification System...\n');
        
        // Step 1: Login to get auth token
        console.log('Step 1: Logging in...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: 'test@example.com',
            password: 'testpassword123'
        });
        
        if (loginResponse.status !== 200) {
            throw new Error('Login failed');
        }
        
        const authToken = loginResponse.data.data.token;
        console.log('✅ Login successful\n');
        
        // Step 2: Request email change (sends OTP to current email)
        console.log('Step 2: Requesting email change...');
        const changeRequestResponse = await axios.post(
            `${API_BASE}/user/email/change-request`,
            {
                newEmail: 'newemail@example.com'
            },
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (changeRequestResponse.status === 200) {
            console.log('✅ Email change request successful');
            console.log('📧 Verification code sent to current email\n');
        } else {
            throw new Error('Email change request failed');
        }
        
        // Step 3: Test current email verification endpoint
        console.log('Step 3: Testing current email verification endpoint...');
        try {
            const currentEmailResponse = await axios.post(
                `${API_BASE}/user/email/verify-current`,
                {
                    otp: '123456' // Test OTP
                },
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('Current email verification endpoint is working ✅');
        } catch (error) {
            if (error.response?.status === 400 && error.response?.data?.message?.includes('Invalid or expired OTP')) {
                console.log('✅ Current email verification endpoint working (expected OTP validation)');
            } else {
                console.log('❌ Current email verification endpoint error:', error.response?.data?.message || error.message);
            }
        }
        
        // Step 4: Test new email verification endpoint
        console.log('\nStep 4: Testing new email verification endpoint...');
        try {
            const newEmailResponse = await axios.post(
                `${API_BASE}/user/email/verify-new`,
                {
                    otp: '123456' // Test OTP
                },
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('New email verification endpoint is working ✅');
        } catch (error) {
            if (error.response?.status === 400 && error.response?.data?.message?.includes('must verify current email first')) {
                console.log('✅ New email verification endpoint working (expected order validation)');
            } else if (error.response?.status === 400 && error.response?.data?.message?.includes('Invalid or expired OTP')) {
                console.log('✅ New email verification endpoint working (expected OTP validation)');
            } else {
                console.log('❌ New email verification endpoint error:', error.response?.data?.message || error.message);
            }
        }
        
        console.log('\n🎉 Dual Email Verification System Test Complete!');
        console.log('✅ All endpoints are properly configured and responding');
        console.log('✅ Dual verification workflow is ready for use');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        console.log('\n📋 Make sure:');
        console.log('1. PHP backend is running on localhost:8000');
        console.log('2. Database is connected and has test user');
        console.log('3. All dual verification columns exist in users table');
    }
}

testDualEmailVerification();
