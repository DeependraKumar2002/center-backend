import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";
import Center from "../models/Center.js";
import fs from 'fs';

// Upload media file
export const uploadMedia = async (req, res) => {
    try {
        // Increase response timeout for this specific route
        req.setTimeout(1800000); // 30 minutes for large file uploads

        console.log('Media upload request received');

        // Use the file from multer
        const file = req.file;

        if (!file) {
            console.log('No file received in request');
            return res.status(400).json({
                message: "No file uploaded",
                error: "File is required"
            });
        }

        console.log('File received for upload:', {
            originalname: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            fieldname: file.fieldname,
            encoding: file.encoding,
            path: file.path,
            destination: file.destination,
            filename: file.filename
        });

        // Debug: Check if the file extension matches what we expect
        const originalName = file.originalname.toLowerCase();
        console.log('File original name and extension check:', {
            originalName: file.originalname,
            lowerCaseName: originalName,
            hasValidExtension: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.svg', '.ico', '.heic', '.heif', '.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.3gp', '.m4v', '.mkv', '.mpg', '.mpeg'].some(ext => originalName.endsWith(ext))
        });

        // Validate file type - check if it's already an image/video MIME type
        let validatedMimeType = file.mimetype;

        console.log('Initial MIME type check:', {
            originalMimetype: file.mimetype,
            isTextPlain: file.mimetype === 'text/plain',
            isMissing: !file.mimetype
        });

        // If the MIME type is text/plain, try to determine the actual type from the file extension
        if (file.mimetype === 'text/plain' || !file.mimetype) {
            const originalName = file.originalname.toLowerCase();
            console.log('Attempting to detect MIME type from extension:', originalName);

            // Map file extensions to proper MIME types
            const extensionMap = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.bmp': 'image/bmp',
                '.webp': 'image/webp',
                '.tiff': 'image/tiff',
                '.svg': 'image/svg+xml',
                '.ico': 'image/x-icon',
                '.heic': 'image/heic',
                '.heif': 'image/heif',
                '.mp4': 'video/mp4',
                '.mov': 'video/quicktime',
                '.avi': 'video/x-msvideo',
                '.wmv': 'video/x-ms-wmv',
                '.flv': 'video/x-flv',
                '.webm': 'video/webm',
                '.3gp': 'video/3gpp',
                '.m4v': 'video/x-m4v',
                '.mkv': 'video/x-matroska',
                '.mpg': 'video/mpeg',
                '.mpeg': 'video/mpeg',
            };

            for (const [ext, mimeType] of Object.entries(extensionMap)) {
                if (originalName.endsWith(ext)) {
                    validatedMimeType = mimeType;
                    console.log('Detected MIME type from extension:', ext, '->', mimeType);
                    break;
                }
            }

            if (validatedMimeType === file.mimetype) {
                console.log('No extension match found, MIME type unchanged');
            }
        } else {
            console.log('MIME type is not text/plain, using original MIME type');
        }

        // Now validate the corrected MIME type
        if (!validatedMimeType || (!validatedMimeType.startsWith('image/') && !validatedMimeType.startsWith('video/'))) {
            console.log('Invalid or missing file type received:', validatedMimeType || file.mimetype);
            console.log('Available file properties:', Object.keys(file || {}));
            return res.status(400).json({
                message: "Invalid file type",
                error: "Only image and video files are allowed",
                receivedType: validatedMimeType || file.mimetype
            });
        }

        // Update the file object with the validated MIME type
        file.mimetype = validatedMimeType;

        // Check file size (convert to MB)
        const fileSizeInMB = file.size / (1024 * 1024);
        console.log(`File size: ${fileSizeInMB.toFixed(2)} MB`);

        // Extract centerCode from the request body if available
        console.log('Request body:', req.body);
        const centerCode = req.body.centerCode || 'default';
        console.log('Uploading to center:', centerCode);

        // Read the file from disk and upload to Cloudinary
        console.log('Preparing to upload to Cloudinary...');
        console.log('File path:', file.path);

        // Check if file exists before attempting to read
        if (!fs.existsSync(file.path)) {
            console.log('File does not exist at path:', file.path);
            return res.status(500).json({
                message: "Server error during media upload",
                error: "File not found on server"
            });
        }

        // Validate file path exists before attempting upload
        console.log('Attempting to upload file to Cloudinary:', file.path);

        // Verify the Cloudinary configuration is loaded
        console.log('Cloudinary config:', {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY ? '***HIDDEN***' : 'NOT SET',
            has_secret: !!process.env.CLOUDINARY_API_SECRET
        });

        // Check if file path exists and is accessible
        if (!file.path || !fs.existsSync(file.path)) {
            console.log('File path does not exist:', file.path);
            return res.status(500).json({
                message: "Server error during media upload",
                error: "File not found on server",
                path: file.path
            });
        }

        try {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: `center_management_app/${centerCode}`,
                resource_type: file.mimetype?.startsWith("video/") ? "video" : "image",
                timeout: 1200000, // 20 minute timeout for upload (increased)
                chunk_size: 10000000, // 10MB chunks for large files
                // Additional options for better handling of large files
                eager_async: true,
                use_filename: true,
                unique_filename: true
            });

            console.log('Cloudinary upload completed successfully');
        } catch (cloudinaryError) {
            console.error('Cloudinary upload failed:', cloudinaryError);

            // Remove the temporary file from disk if Cloudinary upload failed
            try {
                if (file && file.path && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                    console.log('Cleaned up temporary file after Cloudinary error:', file.path);
                }
            } catch (unlinkError) {
                console.error('Error during Cloudinary error cleanup:', unlinkError);
            }

            return res.status(500).json({
                message: "Server error during media upload",
                error: "Cloudinary upload failed",
                details: cloudinaryError.message
            });
        }

        if (result) {
            console.log('Cloudinary upload successful:', result.secure_url);

            // Log the Cloudinary URL to terminal for debugging
            console.log('Uploaded media URL:', result.secure_url);
            console.log('Public ID:', result.public_id);

            // Remove the temporary file from disk
            try {
                fs.unlinkSync(file.path);
                console.log('Temporary file removed:', file.path);
            } catch (unlinkError) {
                console.error('Error removing temporary file:', unlinkError);
            }

            // Return the Cloudinary URL and public_id
            res.status(200).json({
                message: "File uploaded successfully",
                fileUrl: result.secure_url,
                public_id: result.public_id,
                fileType: file.mimetype?.startsWith("video/") ? "video" : "image",
                originalName: file.originalname,
                size: file.size
            });
        } else {
            // This shouldn't happen if the try-catch works properly, but as a safeguard
            console.error('Unexpected: result is undefined after Cloudinary upload');

            // Remove the temporary file from disk
            try {
                if (file && file.path && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                    console.log('Cleaned up temporary file after unexpected error:', file.path);
                }
            } catch (unlinkError) {
                console.error('Error during unexpected error cleanup:', unlinkError);
            }

            return res.status(500).json({
                message: "Server error during media upload",
                error: "Unexpected error: upload result is undefined"
            });
        }

    } catch (error) {
        console.error('Media upload error details:', {
            message: error.message,
            stack: error.stack,
            code: error.error?.code,
            http_code: error.error?.http_code,
            name: error.name,
            file_path: file?.path,
            file_exists: file?.path ? fs.existsSync(file.path) : undefined
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

        // Remove the temporary file from disk if it exists
        try {
            if (file && file.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
                console.log('Cleaned up temporary file after error:', file.path);
            }
        } catch (unlinkError) {
            console.error('Error during error cleanup:', unlinkError);
        }

        res.status(500).json({
            message: "Server error during media upload",
            error: error.message || "Unknown error occurred",
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};