import express from 'express';
import {
    getUserSubmissions,
    getUserSubmissionByUser,
    deleteUserSubmission,
    getPublicSubmissions
} from '../controllers/userSubmissionController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/user-submissions - Get all user submissions (admin only)
router.get('/', getUserSubmissions);

// GET /api/user-submissions/public - Get public submissions (no auth required)
router.get('/public', getPublicSubmissions);

// GET /api/user-submissions/my - Get current user's submissions
router.get('/my', getUserSubmissionByUser);

// DELETE /api/user-submissions/:id - Delete a submission
router.delete('/:id', deleteUserSubmission);

export default router;