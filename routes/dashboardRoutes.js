import express from 'express';
import { getDashboardStats, getDetailedStats } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get basic dashboard statistics (total users, centers, submissions)
router.get('/stats', protect, getDashboardStats);

// Get detailed statistics with breakdowns
router.get('/detailed-stats', protect, getDetailedStats);

export default router;