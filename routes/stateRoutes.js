import express from 'express';
import {
    getAllStates,
    createState,
    createStatesBulk
} from '../controllers/stateController.js';

const router = express.Router();

// GET /api/states
router.get('/', getAllStates);

// POST /api/states
router.post('/', createState);

// POST /api/states/bulk
router.post('/bulk', createStatesBulk);

export default router;