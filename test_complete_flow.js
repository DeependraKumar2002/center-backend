import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

// Test script to verify the complete flow: login -> media upload -> center creation with user email

const API_BASE_URL = 'http://localhost:5000';

// Test user credentials
const testUser = {
    identifier: 'test@example.com', // or username
    password: 'password123'
};

const testCenterData = {
    centerCode: 'TEST001',
    centerName: 'Test Center',
    state: 'Maharashtra',
    city: 'Mumbai',
    latitude: 19.0760,
    longitude: 72.8777,
    address: 'Test Address, Mumbai, Maharashtra',
    biometricDeskCount: '5'
};

async function testCompleteFlow() {
    console.log('Starting complete flow test...');

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

        console.log('Received token:', token.substring(0, 20) + '...');

        // Step 2: Create a test image file to upload
        console.log('Step 2: Creating test image...');
        const testImageContent = Buffer.from('fake image content', 'utf-8');
        const testImagePath = 'test_image.jpg';
        fs.writeFileSync(testImagePath, testImageContent);

        // Step 3: Upload media to Cloudinary via our backend
        console.log('Step 3: Uploading media...');
        const mediaFormData = new FormData();
        mediaFormData.append('mediaFile', fs.createReadStream(testImagePath));
        mediaFormData.append('centerCode', testCenterData.centerCode);

        const mediaResponse = await axios.post(`${API_BASE_URL}/api/media/upload`, mediaFormData, {
            headers: {
                ...mediaFormData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Media upload successful:', mediaResponse.data.message);
        console.log('File URL:', mediaResponse.data.fileUrl);
        console.log('User info in response:', mediaResponse.data.user);

        // Step 4: Create center with media data
        console.log('Step 4: Creating center with user email...');

        // Prepare center data with media
        const centerWithMedia = {
            ...testCenterData,
            media: {
                entry: [{
                    url: mediaResponse.data.fileUrl,
                    publicId: mediaResponse.data.public_id,
                    type: mediaResponse.data.fileType,
                    originalName: 'test_image.jpg',
                    address: 'Test location address'
                }]
            }
        };

        const centerResponse = await axios.post(`${API_BASE_URL}/api/centers`, centerWithMedia, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Center creation successful:', centerResponse.data.centerName);
        console.log('Center submitted by:', centerResponse.data.submittedBy);

        // Step 5: Verify that the center has the user's email
        if (centerResponse.data.submittedBy === mediaResponse.data.user.email) {
            console.log('✓ SUCCESS: User email properly stored with center data');
        } else {
            console.log('✗ ERROR: User email mismatch');
            console.log('  Expected:', mediaResponse.data.user.email);
            console.log('  Actual:', centerResponse.data.submittedBy);
        }

        // Step 6: Retrieve the center to verify data is stored correctly
        console.log('Step 5: Retrieving created center...');
        const retrievedCenter = await axios.get(`${API_BASE_URL}/api/centers/code/${testCenterData.centerCode}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Retrieved center submitted by:', retrievedCenter.data.submittedBy);
        console.log('Center has media:', retrievedCenter.data.media && retrievedCenter.data.media.entry.length > 0);

        // Cleanup
        fs.unlinkSync(testImagePath);

        console.log('\n✓ Complete flow test passed!');

    } catch (error) {
        console.error('✗ Test failed:', error.response?.data?.message || error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        } else {
            console.error('Error details:', error.message);
            console.error('Stack trace:', error.stack);
        }

        // Cleanup in case of error
        try {
            const testImagePath = 'test_image.jpg';
            if (fs.existsSync(testImagePath)) {
                fs.unlinkSync(testImagePath);
            }
        } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError.message);
        }
    }
}

// Run the test
testCompleteFlow();