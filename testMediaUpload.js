import dotenv from "dotenv";
import fs from "fs";
import axios from "axios";

dotenv.config();

const testMediaUpload = async () => {
    try {
        // Create a simple text file to upload
        const testContent = "This is a test file for media upload";
        fs.writeFileSync("test.txt", testContent);

        // Read the file
        const fileBuffer = fs.readFileSync("test.txt");

        // Create form data
        const formData = new FormData();
        formData.append("mediaFile", new Blob([fileBuffer]), "test.txt");
        formData.append("centerCode", "MH001");

        // Set headers
        const headers = {
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDk0YTc3YzNkMDdkYjU2YzA1NTIzNCIsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3NjY0MTY3NTMsImV4cCI6MTc2NjUwMzE1M30.FGBjMOym4b3W0gPmclrs0hyQR7nYIqra_fJ9u9qAU3g",
            "Content-Type": "multipart/form-data"
        };

        console.log("Uploading file...");

        // Upload file
        const response = await axios.post(
            "http://localhost:5000/api/media/upload",
            formData,
            { headers }
        );

        console.log("Upload response:", response.data);

        // Clean up test file
        fs.unlinkSync("test.txt");

        process.exit(0);
    } catch (error) {
        console.error("Error uploading file:", error.response?.data || error.message);

        // Clean up test file
        if (fs.existsSync("test.txt")) {
            fs.unlinkSync("test.txt");
        }

        process.exit(1);
    }
};

testMediaUpload();