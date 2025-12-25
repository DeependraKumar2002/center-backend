import express from 'express';
import { getDashboardStats, getDetailedStats } from '../controllers/dashboardController.js';


const router = express.Router();

// Get basic dashboard statistics (total users, centers, submissions)
router.get('/stats', getDashboardStats);

// Get detailed statistics with breakdowns
router.get('/detailed-stats', getDetailedStats);

export default router;