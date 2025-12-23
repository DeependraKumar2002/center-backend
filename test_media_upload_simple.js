import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

// Simple test to verify media upload functionality
const API_BASE_URL = 'http://localhost:5000';

// Test user credentials
const testUser = {
    identifier: 'test@example.com', // or username
    password: 'password123'
};

async function testMediaUpload() {
    console.log('Starting media upload test...');

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

        // Step 2: Create a simple text file to upload
        console.log('Step 2: Creating test file...');
        const testContent = "This is a test file for media upload";
        const testFilePath = 'test_upload.txt';
        fs.writeFileSync(testFilePath, testContent);

        // Step 3: Upload media
        console.log('Step 3: Uploading media...');
        const formData = new FormData();
        formData.append('mediaFile', fs.createReadStream(testFilePath));
        formData.append('centerCode', 'TEST003');

        const response = await axios.post(`${API_BASE_URL}/api/media/upload`, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Upload response:', response.data.message);
        console.log('File URL:', response.data.fileUrl);
        console.log('Uploaded by user:', response.data.user.email);
        console.log('Associated with center:', response.data.center.code);

        // Cleanup
        fs.unlinkSync(testFilePath);

        console.log('\n✓ Media upload test completed!');

    } catch (error) {
        console.error('✗ Media upload test failed:', error.response?.data?.message || error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        } else {
            console.error('Error details:', error.message);
        }

        // Cleanup in case of error
        try {
            const testFilePath = 'test_upload.txt';
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
            }
        } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError.message);
        }
    }
}

// Run the test
testMediaUpload();