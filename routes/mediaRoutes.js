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

    // Check if the MIME type is valid (primary check)
    const isValidMimeType = allowedTypes.includes(file.mimetype);

    // If MIME type is text/plain or not recognized, check the file extension
    const originalName = file.originalname.toLowerCase();
    const hasValidImageExtension = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.svg', '.ico', '.heic', '.heif'].some(ext => originalName.endsWith(ext));
    const hasValidVideoExtension = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.3gp', '.m4v', '.mkv', '.mpg', '.mpeg'].some(ext => originalName.endsWith(ext));

    if (!isValidMimeType && file.mimetype === 'text/plain' && (hasValidImageExtension || hasValidVideoExtension)) {
        // If MIME type is text/plain but has a valid image/video extension, allow it
        console.log('File accepted based on extension:', file.originalname, 'Type:', file.mimetype, 'Extension:', originalName);
        cb(null, true);
    } else if (!isValidMimeType) {
        console.log('File rejected:', file.originalname, 'Invalid type:', file.mimetype, 'Original name:', originalName);
        return cb(
            new Error(`Invalid file type: ${file.mimetype}`),
            false
        );
    } else {
        console.log('File accepted:', file.originalname, 'Type:', file.mimetype);
        cb(null, true);
    }
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
router.post("/upload", (req, res, next) => {
    upload.single("file")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading
            console.error('Multer error:', err);
            return res.status(400).json({
                success: false,
                error: err.message || 'File upload error',
            });
        } else if (err) {
            // An error occurred during file filtering
            console.error('File filter error:', err);
            return res.status(400).json({
                success: false,
                error: err.message || 'File type not allowed',
            });
        }

        // If no error, continue with the next middleware
        if (!req.file) {
            console.log('No file received in request');
            return res.status(400).json({
                success: false,
                error: 'No file received',
            });
        }

        console.log('File received for processing:', {
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
        });

        // Pass control to the controller
        next();
    });
}, uploadMedia);

export default router;