import express from "express";
import { uploadMedia } from "../controllers/mediaController.js";
import multer from "multer";

const router = express.Router();

// Configure multer for file upload with memory storage for production environments
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit (increased from 50MB)
        fieldSize: 100 * 1024 * 1024, // 100MB field size limit
        fields: 20, // Max number of non-file fields
        parts: 200, // Max number of parts (files + fields)
    },
    // Add file filter to ensure only valid files are accepted
    fileFilter: (req, file, cb) => {
        console.log('File filter called for:', file.originalname, 'Mimetype:', file.mimetype);
        // Accept images and videos
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            console.log('File accepted:', file.originalname);
            cb(null, true);
        } else {
            console.log('File rejected:', file.originalname, 'Invalid type:', file.mimetype);
            cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
        }
    }
});

// POST /media/upload - Public route
router.post("/upload", (req, res, next) => {
    console.log('Media upload route hit');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Content-Length:', req.headers['content-length']);
    console.log('Raw body keys:', Object.keys(req.body || {}));
    console.log('Raw files keys:', Object.keys(req.files || req.file || {}));
    console.log('Expected field name: mediaFile');

    upload.single("mediaFile")(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err.message);
            console.error('Multer error details:', err);
            return res.status(400).json({
                message: 'File upload error',
                error: err.message
            });
        }

        console.log('File processed by Multer:', !!req.file);
        if (!req.file) {
            console.log('File object missing after Multer processing');
            console.log('All available request files:', Object.keys(req.files || {}));
            console.log('All available request body:', req.body);
        }

        next();
    });
}, uploadMedia);

export default router;