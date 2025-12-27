import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";
import Center from "../models/Center.js";

// Upload media file
export const uploadMedia = async (req, res) => {
    try {
        // Increase response timeout for this specific route
        req.setTimeout(600000); // 10 minutes for large file uploads

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        console.log('File received for upload:', req.file.filename, 'Size:', req.file.size, 'Mime:', req.file.mimetype);

        console.log('Attempting to upload file to Cloudinary:', req.file.path);

        // Extract centerCode from the request body if available
        const centerCode = req.body.centerCode || 'default';

        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: `center_management_app/${centerCode}`,
            resource_type: req.file.mimetype?.startsWith("video/") ? "video" : "image",
            timeout: 300000, // 5 minute timeout for upload
        });

        console.log('Cloudinary upload successful:', result.secure_url);

        // Delete the temporary file after successful upload
        try {
            const fs = await import('fs');
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
                console.log('Temporary file deleted:', req.file.path);
            }
        } catch (fsError) {
            console.error('Error deleting temporary file after successful upload:', fsError.message);
        }

        // Log the Cloudinary URL to terminal for debugging
        console.log('Uploaded media URL:', result.secure_url);
        console.log('Public ID:', result.public_id);

        // Return the Cloudinary URL and public_id
        res.status(200).json({
            message: "File uploaded successfully",
            fileUrl: result.secure_url,
            public_id: result.public_id,
            fileType: req.file.mimetype?.startsWith("video/") ? "video" : "image"
        });

    } catch (error) {
        console.error('Media upload error:', error);

        // Check if the error is related to timeout or network
        if (error.message.includes('timeout') || error.message.includes('network')) {
            return res.status(408).json({
                message: "Upload timeout - file too large or network issue",
                error: error.message
            });
        }

        // Delete the temporary file if upload fails
        if (req.file && req.file.path) {
            try {
                const fs = await import('fs');
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                    console.log('Temporary file deleted after error:', req.file.path);
                }
            } catch (fsError) {
                console.error('Error deleting temporary file after error:', fsError.message);
            }
        }

        res.status(500).json({
            message: "Server error during media upload",
            error: error.message
        });
    }
};