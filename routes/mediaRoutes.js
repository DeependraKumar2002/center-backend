import express from "express";
import { uploadMedia } from "../controllers/mediaController.js";
import multer from "multer";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// POST /media/upload - Protected route
router.post("/upload", verifyToken, upload.single("mediaFile"), uploadMedia);

export default router;