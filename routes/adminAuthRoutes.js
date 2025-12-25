import express from 'express';
import {
    registerAdmin,
    loginAdmin,
    getAdminProfile,
    updateAdminProfile,
    changeAdminPassword,
    getAllAdmins
} from '../controllers/adminAuthController.js';
import { verifyToken } from '../middleware/auth.js'; // Using the existing verifyToken middleware

const router = express.Router();

// Public routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// Protected routes - require admin authentication
router.get('/profile', verifyToken, getAdminProfile);
router.put('/profile', verifyToken, updateAdminProfile);
router.put('/change-password', verifyToken, changeAdminPassword);
router.get('/', verifyToken, getAllAdmins);

export default router;