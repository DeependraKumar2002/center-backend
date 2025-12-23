import express from 'express';
import {
    getUserSubmissions,
    getUserSubmissionByUser,
    deleteUserSubmission
} from '../controllers/userSubmissionController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/user-submissions - Get all user submissions (admin only)
router.get('/', verifyToken, getUserSubmissions);

// GET /api/user-submissions/my - Get current user's submissions
router.get('/my', verifyToken, getUserSubmissionByUser);

// DELETE /api/user-submissions/:id - Delete a submission
router.delete('/:id', verifyToken, deleteUserSubmission);

export default router;