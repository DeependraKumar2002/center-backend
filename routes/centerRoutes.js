import express from 'express';
import {
    getAllCenters,
    getCentersByState,
    getCentersByCity,
    getCenterByCode,
    getCentersByName,
    createCenter,
    createCentersBulk
} from '../controllers/centerController.js';

const router = express.Router();

// GET /api/centers
router.get('/', getAllCenters);

// GET /api/centers/state/:state
router.get('/state/:state', getCentersByState);

// GET /api/centers/city/:city
router.get('/city/:city', getCentersByCity);

// GET /api/centers/code/:code
router.get('/code/:code', getCenterByCode);

// GET /api/centers/name/:name
router.get('/name/:name', getCentersByName);

// POST /api/centers
router.post('/', createCenter);

// POST /api/centers/bulk
router.post('/bulk', createCentersBulk);

export default router;