import express from "express";
import { getAllStates, createState } from "../controllers/stateController.js";

const router = express.Router();

// GET /states
router.get("/", getAllStates);

// POST /states
router.post("/", createState);

export default router;