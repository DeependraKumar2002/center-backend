import express from "express";
import { uploadMedia } from "../controllers/mediaController.js";
import multer from "multer";

const router = express.Router();

// Configure multer for file upload with memory storage for production environments
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
        fieldSize: 50 * 1024 * 1024, // 50MB field size limit
        fields: 10, // Max number of non-file fields
        parts: 100, // Max number of parts (files + fields)
    },
    // Add file filter to ensure only valid files are accepted
    fileFilter: (req, file, cb) => {
        // Accept images and videos
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
        }
    }
});

// POST /media/upload - Public route
router.post("/upload", upload.single("mediaFile"), uploadMedia);

export default router;