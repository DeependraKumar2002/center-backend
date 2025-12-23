import axios from 'axios';

// Test to verify authentication protection on routes
const API_BASE_URL = 'http://localhost:5000';

async function testAuthProtection() {
    console.log('Testing authentication protection...');

    try {
        // Test 1: Try to access protected center creation without token
        console.log('Test 1: Creating center without token (should fail)...');
        try {
            const response = await axios.post(`${API_BASE_URL}/api/centers`, {
                centerCode: 'TEST003',
                centerName: 'Test Center 3',
                state: 'Maharashtra',
                city: 'Mumbai'
            });
            console.log('❌ Unexpected: Center creation without token succeeded');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ Expected: Center creation without token failed with 401');
            } else {
                console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
            }
        }

        // Test 2: Try to access media upload without token
        console.log('\nTest 2: Media upload without token (should fail)...');
        try {
            const formData = new FormData();
            // This is just to test auth, we don't need to provide actual file data
            const response = await axios.post(`${API_BASE_URL}/api/media/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('❌ Unexpected: Media upload without token succeeded');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ Expected: Media upload without token failed with 401');
            } else {
                console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
            }
        }

        // Test 3: Login and get a valid token
        console.log('\nTest 3: Login to get valid token...');
        const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
            identifier: 'test@example.com',
            password: 'password123'
        });

        const token = loginResponse.data.token;
        console.log('✅ Login successful, got token');

        // Test 4: Try to create center with valid token
        console.log('\nTest 4: Creating center with valid token (should succeed)...');
        try {
            const response = await axios.post(`${API_BASE_URL}/api/centers`, {
                centerCode: 'TEST004',
                centerName: 'Test Center 4',
                state: 'Maharashtra',
                city: 'Mumbai'
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.submittedBy === 'test@example.com') {
                console.log('✅ Center created successfully with user email:', response.data.submittedBy);
            } else {
                console.log('❌ Center created but user email not stored properly');
            }
        } catch (error) {
            console.log('❌ Center creation failed:', error.response?.data?.message || error.message);
        }

        console.log('\n✅ Authentication protection test completed!');

    } catch (error) {
        console.error('❌ Test failed with unexpected error:', error.message);
    }
}

// Since FormData is not available in Node.js by default in this context, 
// let me create a more basic test
async function basicAuthTest() {
    console.log('Basic authentication protection test...');

    try {
        // Test 1: Try to access protected center creation without token
        console.log('Test 1: Creating center without token (should fail)...');
        try {
            const response = await axios.post(`${API_BASE_URL}/api/centers`, {
                centerCode: 'TEST003',
                centerName: 'Test Center 3',
                state: 'Maharashtra',
                city: 'Mumbai'
            });
            console.log('❌ Unexpected: Center creation without token succeeded');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ Expected: Center creation without token failed with 401');
            } else {
                console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
            }
        }

        // Test 2: Login and get a valid token
        console.log('\nTest 2: Login to get valid token...');
        const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
            identifier: 'test@example.com',
            password: 'password123'
        });

        const token = loginResponse.data.token;
        console.log('✅ Login successful, got token');

        // Test 3: Try to create center with valid token
        console.log('\nTest 3: Creating center with valid token (should succeed)...');
        try {
            const response = await axios.post(`${API_BASE_URL}/api/centers`, {
                centerCode: 'TEST005',
                centerName: 'Test Center 5',
                state: 'Maharashtra',
                city: 'Mumbai'
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.submittedBy === 'test@example.com') {
                console.log('✅ Center created successfully with user email:', response.data.submittedBy);
            } else {
                console.log('❌ Center created but user email not stored properly');
                console.log('   Actual submittedBy:', response.data.submittedBy);
            }
        } catch (error) {
            console.log('❌ Center creation failed:', error.response?.data?.message || error.message);
        }

        console.log('\n✅ Basic authentication protection test completed!');

    } catch (error) {
        console.error('❌ Test failed with unexpected error:', error.message);
    }
}

// Run the test
basicAuthTest();