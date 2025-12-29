import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";
import Center from "../models/Center.js";
import { Readable } from 'stream';

// Upload media file
export const uploadMedia = async (req, res) => {
    try {
        // Increase response timeout for this specific route
        req.setTimeout(1200000); // 20 minutes for large file uploads

        console.log('Media upload request received');
        console.log('Request files:', Object.keys(req.files || req.file || {}).join(', '));
        console.log('Request body:', req.body);

        if (!req.file) {
            console.log('No file received in request');
            return res.status(400).json({
                message: "No file uploaded",
                error: "File is required"
            });
        }

        console.log('File received for upload:', {
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            fieldname: req.file.fieldname,
            bufferLength: req.file.buffer ? req.file.buffer.length : 0
        });

        // Validate file type
        if (!req.file.mimetype.startsWith('image/') && !req.file.mimetype.startsWith('video/')) {
            console.log('Invalid file type received:', req.file.mimetype);
            return res.status(400).json({
                message: "Invalid file type",
                error: "Only image and video files are allowed"
            });
        }

        // Check file size (convert to MB)
        const fileSizeInMB = req.file.size / (1024 * 1024);
        console.log(`File size: ${fileSizeInMB.toFixed(2)} MB`);

        // Extract centerCode from the request body if available
        const centerCode = req.body.centerCode || 'default';
        console.log('Uploading to center:', centerCode);

        // For memory storage, upload the buffer directly to Cloudinary
        // Using data URL method for direct upload from buffer
        console.log('Preparing to upload to Cloudinary...');

        const fileDataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        const result = await cloudinary.uploader.upload(fileDataUrl, {
            folder: `center_management_app/${centerCode}`,
            resource_type: req.file.mimetype?.startsWith("video/") ? "video" : "image",
            timeout: 600000, // 10 minute timeout for upload (increased)
            chunk_size: 6000000, // 6MB chunks for large files
            // Additional options for better handling of large files
            eager_async: true,
            use_filename: true,
            unique_filename: true
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
            http_code: error.error?.http_code,
            name: error.name
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
            error: error.message || "Unknown error occurred",
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};