import express from "express";
import { getAllCenters, getCentersByState, getCentersByCity, getCenterByCode, createCenter } from "../controllers/centerController.js";

const router = express.Router();

// GET /centers
router.get("/", getAllCenters);

// GET /centers/by-state/:stateId
router.get("/by-state/:stateId", getCentersByState);

// GET /centers/by-city/:cityId
router.get("/by-city/:cityId", getCentersByCity);

// GET /centers/by-code/:code
router.get("/by-code/:code", getCenterByCode);

// POST /centers
router.post("/", createCenter);

export default router;