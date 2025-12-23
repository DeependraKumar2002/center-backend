import express from "express";
import { uploadUsersFromCSV, uploadCentersFromCSV } from "../controllers/adminController.js";
import multer from "multer";

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

const upload = multer({ storage: storage });

// POST /admin/upload-users
router.post("/upload-users", upload.single("csvFile"), uploadUsersFromCSV);

// POST /admin/upload-centers
router.post("/upload-centers", upload.single("csvFile"), uploadCentersFromCSV);

export default router;