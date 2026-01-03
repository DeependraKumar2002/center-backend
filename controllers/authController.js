import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Register a new user
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email or username" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    const savedUser = await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: savedUser._id, username: savedUser.username, email: savedUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: { id: savedUser._id, username: savedUser.username, email: savedUser.email },
      token
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude password field
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { identifier, password } = req.body;

  // Trim whitespace from identifier and password
  const trimmedIdentifier = identifier?.trim();
  const trimmedPassword = password?.trim();

  try {
    // Check for user by email or username
    let user;
    if (trimmedIdentifier.includes('@')) {
      // If input contains '@', treat it as email
      user = await User.findOne({ email: trimmedIdentifier });
    } else {
      // Otherwise, treat it as username
      user = await User.findOne({ username: trimmedIdentifier });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(trimmedPassword, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      user: { id: user._id, username: user.username, email: user.email },
      token
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};