import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";
import Center from "../models/Center.js";
import { Readable } from 'stream';

// Upload media file
export const uploadMedia = async (req, res) => {
    try {
        // Increase response timeout for this specific route
        req.setTimeout(600000); // 10 minutes for large file uploads

        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded",
                error: "File is required"
            });
        }

        console.log('File received for upload:', {
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            fieldname: req.file.fieldname
        });

        // Validate file type
        if (!req.file.mimetype.startsWith('image/') && !req.file.mimetype.startsWith('video/')) {
            return res.status(400).json({
                message: "Invalid file type",
                error: "Only image and video files are allowed"
            });
        }

        // Extract centerCode from the request body if available
        const centerCode = req.body.centerCode || 'default';
        console.log('Uploading to center:', centerCode);

        // For memory storage, upload the buffer directly to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `center_management_app/${centerCode}`,
                    resource_type: req.file.mimetype?.startsWith("video/") ? "video" : "image",
                    timeout: 300000, // 5 minute timeout for upload
                    // Additional options for better handling
                    chunk_size: 6000000, // 6MB chunks for large files
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

            // Create a readable stream from the buffer and pipe to Cloudinary
            const bufferStream = new Readable();
            bufferStream.push(req.file.buffer);
            bufferStream.push(null); // End of stream
            bufferStream.pipe(uploadStream);
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
            fileType: req.file.mimetype?.startsWith("video/") ? "video" : "image",
            originalName: req.file.originalname,
            size: req.file.size
        });

    } catch (error) {
        console.error('Media upload error details:', {
            message: error.message,
            stack: error.stack,
            code: error.error?.code,
            http_code: error.error?.http_code
        });

        // Check if the error is related to timeout or network
        if (error.message && (error.message.includes('timeout') || error.message.includes('network'))) {
            return res.status(408).json({
                message: "Upload timeout - file too large or network issue",
                error: error.message
            });
        }

        // Handle specific Cloudinary errors
        if (error.error?.http_code) {
            return res.status(error.error.http_code).json({
                message: "Upload failed",
                error: error.error.message || error.message
            });
        }

        res.status(500).json({
            message: "Server error during media upload",
            error: error.message || "Unknown error occurred"
        });
    }
};