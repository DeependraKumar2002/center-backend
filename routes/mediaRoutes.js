import express from "express";
import { uploadMedia } from "../controllers/mediaController.js";
import multer from "multer";
import { existsSync, mkdirSync } from 'fs';

const router = express.Router();

// Configure multer for file upload with increased limits for deployed environments
// Use memory storage for production to avoid file system issues on platforms like Render
const storage = multer.memoryStorage(); // Changed from diskStorage to memoryStorage

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
        fieldSize: 50 * 1024 * 1024, // 50MB field size limit
        fields: 10, // Max number of non-file fields
        parts: 100, // Max number of parts (files + fields)
    }
});

// POST /media/upload - Public route
router.post("/upload", upload.single("mediaFile"), uploadMedia);

export default router;