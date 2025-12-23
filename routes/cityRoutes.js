import express from 'express';
import {
    getAllCities,
    getCitiesByState,
    createCity,
    createCitiesBulk
} from '../controllers/cityController.js';

const router = express.Router();

// GET /api/cities
router.get('/', getAllCities);

// GET /api/cities/state/:state
router.get('/state/:state', getCitiesByState);

// POST /api/cities
router.post('/', createCity);

// POST /api/cities/bulk
router.post('/bulk', createCitiesBulk);

export default router;