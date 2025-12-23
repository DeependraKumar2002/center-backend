import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";
import Center from "../models/Center.js";

// Upload media file
export const uploadMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Get user from token (assuming it's attached by auth middleware)
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Get user details
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get center data from request body
        const { centerCode } = req.body;
        if (!centerCode) {
            return res.status(400).json({ message: "Center code is required" });
        }

        // Get center details
        const center = await Center.findOne({ centerCode });
        let centerInfo;
        if (!center) {
            // For new centers that don't exist yet, we'll create a minimal center object
            // This allows media uploads for centers that are being created
            console.log(`Center with code ${centerCode} not found, creating temporary center info`);
            centerInfo = {
                centerCode: centerCode,
                centerName: "New Center", // Will be updated when center is created
                state: "", // Will be updated when center is created
                city: ""  // Will be updated when center is created
            };
        } else {
            centerInfo = center;
        }

        console.log('Attempting to upload file to Cloudinary:', req.file.path);

        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "center_management_app",
            resource_type: req.file.mimetype?.startsWith("video/") ? "video" : "image"
        });

        console.log('Cloudinary upload successful:', result.secure_url);

        // Delete the temporary file after successful upload
        const fs = require('fs');
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
            console.log('Temporary file deleted:', req.file.path);
        }

        // Return response with all associated data
        res.status(200).json({
            message: "File uploaded successfully",
            fileUrl: result.secure_url,
            public_id: result.public_id,
            fileType: result.resource_type,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            center: {
                code: centerInfo.centerCode,
                name: centerInfo.centerName,
                state: centerInfo.state,
                city: centerInfo.city
            }
        });
    } catch (error) {
        console.error('Media upload error:', error);

        // Delete the temporary file if upload fails
        if (req.file && req.file.path) {
            const fs = require('fs');
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
                console.log('Temporary file deleted after error:', req.file.path);
            }
        }

        res.status(500).json({
            message: "Server error during media upload",
            error: error.message
        });
    }
};