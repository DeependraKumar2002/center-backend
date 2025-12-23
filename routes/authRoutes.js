import express from "express";
import { login, register, getAllUsers } from "../controllers/authController.js";

const router = express.Router();

// POST /auth/register
router.post("/register", register);

// POST /auth/login
router.post("/login", login);

// GET /auth/users
router.get("/users", getAllUsers);

export default router;
