import axios from 'axios';

// Simple test to verify the user email is stored with center data
const API_BASE_URL = 'http://localhost:5000';

// Test user credentials
const testUser = {
    identifier: 'test@example.com', // or username
    password: 'password123'
};

const testCenterData = {
    centerCode: 'TEST006',
    centerName: 'Test Center 6',
    state: 'Maharashtra',
    city: 'Mumbai',
    latitude: 19.0760,
    longitude: 72.8777,
    address: 'Test Address, Mumbai, Maharashtra',
    biometricDeskCount: '5'
};

async function testSimpleFlow() {
    console.log('Starting simple flow test...');

    let token = null;

    try {
        // Step 1: Login
        console.log('Step 1: Logging in...');
        const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
            identifier: testUser.identifier,
            password: testUser.password
        });

        console.log('Login successful:', loginResponse.data.message);
        token = loginResponse.data.token;

        if (!token) {
            throw new Error('No token received from login');
        }

        console.log('Received token, user email:', loginResponse.data.user.email);

        // Step 2: Create center without media
        console.log('Step 2: Creating center with user email...');

        const centerResponse = await axios.post(`${API_BASE_URL}/api/centers`, testCenterData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Center creation successful:', centerResponse.data.centerName);
        console.log('Center submitted by:', centerResponse.data.submittedBy);

        // Step 3: Verify that the center has the user's email
        if (centerResponse.data.submittedBy === loginResponse.data.user.email) {
            console.log('✓ SUCCESS: User email properly stored with center data');
        } else {
            console.log('✗ ERROR: User email mismatch');
            console.log('  Expected:', loginResponse.data.user.email);
            console.log('  Actual:', centerResponse.data.submittedBy);
        }

        // Step 4: Retrieve the center to verify data is stored correctly
        console.log('Step 4: Retrieving created center...');
        const retrievedCenter = await axios.get(`${API_BASE_URL}/api/centers/code/${testCenterData.centerCode}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Retrieved center submitted by:', retrievedCenter.data.submittedBy);

        console.log('\n✓ Simple flow test completed!');

    } catch (error) {
        console.error('✗ Test failed:', error.response?.data?.message || error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        } else {
            console.error('Error details:', error.message);
            console.error('Stack trace:', error.stack);
        }
    }
}

// Run the test
testSimpleFlow();