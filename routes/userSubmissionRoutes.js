import express from 'express';
import {
    getUserSubmissions,
    getPublicSubmissions,
    getUserSubmissionByDate,
    updateSubmission,
    checkTodaySubmission
} from '../controllers/userSubmissionController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/user-submissions - Get all user submissions (admin only)
router.get('/', verifyToken, getUserSubmissions);

// GET /api/user-submissions/public - Get public submissions (no auth required)
router.get('/public', getPublicSubmissions);

// GET /api/user-submissions/today - Check if user has submitted today
router.get('/today', verifyToken, checkTodaySubmission);

// GET /api/user-submissions/date/:date - Get user submission for a specific date
router.get('/date/:date', verifyToken, getUserSubmissionByDate);

// PUT /api/user-submissions/:id - Update user submission
router.put('/:id', verifyToken, updateSubmission);

export default router;