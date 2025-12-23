import express from "express";
import { getAllCities, getCitiesByState, createCity } from "../controllers/cityController.js";

const router = express.Router();

// GET /cities
router.get("/", getAllCities);

// GET /cities/by-state/:stateId
router.get("/by-state/:stateId", getCitiesByState);

// POST /cities
router.post("/", createCity);

export default router;