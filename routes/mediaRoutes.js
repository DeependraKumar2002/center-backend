import express from "express";
import { uploadMedia } from "../controllers/mediaController.js";
import multer from "multer";


const router = express.Router();

// Configure multer for file upload with increased limits for deployed environments
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // In deployed environments, ensure uploads directory exists
        const fs = require('fs');
        const uploadDir = 'uploads/';

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

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