import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();
connectDB();

const getToken = async () => {
    try {
        // Find the test user
        const user = await User.findOne({ username: "testuser" });

        if (!user) {
            console.log("Test user not found");
            process.exit(1);
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        console.log("User found:", user.username);
        console.log("Token:", token);
        process.exit(0);
    } catch (error) {
        console.error("Error getting token:", error);
        process.exit(1);
    }
};

getToken();