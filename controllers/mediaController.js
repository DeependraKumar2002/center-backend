import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";
import Center from "../models/Center.js";
import { existsSync, unlinkSync } from 'fs';
import { Readable } from 'stream';

// Upload media file
export const uploadMedia = async (req, res) => {
    try {
        // Increase response timeout for this specific route
        req.setTimeout(600000); // 10 minutes for large file uploads

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        console.log('File received for upload:', req.file.originalname, 'Size:', req.file.size, 'Mime:', req.file.mimetype);

        // Extract centerCode from the request body if available
        const centerCode = req.body.centerCode || 'default';

        // For memory storage, we need to upload the buffer directly to Cloudinary
        // Create a readable stream from the buffer
        const fileStream = Readable.from(req.file.buffer);

        // Upload file to Cloudinary directly from buffer
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `center_management_app/${centerCode}`,
                    resource_type: req.file.mimetype?.startsWith("video/") ? "video" : "image",
                    timeout: 300000, // 5 minute timeout for upload
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            // Pipe the file stream to Cloudinary
            fileStream.pipe(uploadStream);
        });

        console.log('Cloudinary upload successful:', result.secure_url);

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

        res.status(500).json({
            message: "Server error during media upload",
            error: error.message
        });
    }
};