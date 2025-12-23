import bcrypt from "bcrypt";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

// Connect to database
connectDB();

// Test users data
const testUsers = [
    {
        username: "testuser",
        email: "test@example.com",
        password: "password123"
    },
    {
        username: "johndoe",
        email: "john.doe@example.com",
        password: "securepassword"
    }
];

const createTestUsers = async () => {
    try {
        // Clear existing users
        await User.deleteMany({});
        console.log("Cleared existing users");

        // Create test users
        for (const userData of testUsers) {
            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

            // Create new user
            const newUser = new User({
                username: userData.username,
                email: userData.email,
                password: hashedPassword
            });

            const savedUser = await newUser.save();
            console.log(`Created user: ${savedUser.username} (${savedUser.email})`);
        }

        console.log("Test users created successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error creating test users:", error);
        process.exit(1);
    }
};

createTestUsers();