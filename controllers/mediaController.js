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
        if (!center) {
            return res.status(404).json({ message: "Center not found" });
        }

        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "center_management_app",
            resource_type: req.file.mimetype.startsWith("video/") ? "video" : "image"
        });

        // Return response with all associated data
        res.json({
            message: "File uploaded successfully",
            fileUrl: result.secure_url,
            fileType: result.resource_type,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            center: {
                code: center.centerCode,
                name: center.centerName,
                state: center.state,
                city: center.city
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};