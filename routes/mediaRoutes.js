import express from "express";
import { uploadMedia } from "../controllers/mediaController.js";
import multer from "multer";
import path from 'path';
import fs from 'fs';

const router = express.Router();

/* ===========================
   STORAGE CONFIG
=========================== */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads';

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },

    filename: function (req, file, cb) {
        const uniqueName =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + path.extname(file.originalname));
    },
});

/* ===========================
   FILE FILTER
=========================== */
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/webp',
        'image/gif',
        'image/bmp',
        'image/tiff',
        'image/svg+xml',
        'image/x-icon',
        'image/heic',
        'image/heif',
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-ms-wmv',
        'video/x-flv',
        'video/webm',
        'video/3gpp',
        'video/x-m4v',
        'video/x-matroska',
        'video/mpeg',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
        console.log('File rejected:', file.originalname, 'Invalid type:', file.mimetype);
        return cb(
            new Error(`Invalid file type: ${file.mimetype}`),
            false
        );
    }

    console.log('File accepted:', file.originalname, 'Type:', file.mimetype);
    cb(null, true);
};

/* ===========================
   MULTER INSTANCE
=========================== */
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
    },
});

// POST /media/upload - Public route
router.post("/upload", upload.single("file"), (req, res, next) => {
    try {
        if (!req.file) {
            console.log('No file received in request');
            return res.status(400).json({
                success: false,
                error: 'No file received',
            });
        }

        console.log('File uploaded successfully:', {
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
        });

        // Pass control to the controller
        req.processedFile = req.file;
        next();
    } catch (error) {
        console.error('UPLOAD ERROR:', error);
        return res.status(500).json({
            success: false,
            error: 'Server error during upload',
        });
    }
}, uploadMedia);

export default router;