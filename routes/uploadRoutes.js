import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { uploadUsersCSV, uploadCentersCSV } from "../controllers/uploadController.js";

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "csv-files",
    resource_type: "raw", // IMPORTANT for CSV
  },
});

const upload = multer({ storage });

// POST /upload/users
router.post("/users", upload.single("file"), uploadUsersCSV);

// POST /upload/centers
router.post("/centers", upload.single("file"), uploadCentersCSV);

export default router;