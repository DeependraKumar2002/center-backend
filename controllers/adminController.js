import csv from "csv-parser";
import fs from "fs";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import Center from "../models/Center.js";
import State from "../models/State.js";
import City from "../models/City.js";

// Upload users from CSV
export const uploadUsersFromCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const results = [];
        const errors = [];

        // Parse CSV file
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on("data", (data) => results.push(data))
            .on("end", async () => {
                // Process each row
                for (let i = 0; i < results.length; i++) {
                    const row = results[i];
                    try {
                        const { username, email, password } = row;

                        // Validate required fields
                        if (!username || !email || !password) {
                            errors.push(`Row ${i + 1}: Missing required fields`);
                            continue;
                        }

                        // Check if user already exists
                        const existingUser = await User.findOne({
                            $or: [{ email }, { username }]
                        });

                        if (existingUser) {
                            errors.push(`Row ${i + 1}: User with this email or username already exists`);
                            continue;
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

                        await newUser.save();
                    } catch (error) {
                        errors.push(`Row ${i + 1}: ${error.message}`);
                    }
                }

                // Delete temporary file
                fs.unlinkSync(req.file.path);

                res.json({
                    message: "CSV processing completed",
                    totalRows: results.length,
                    successful: results.length - errors.length,
                    errors
                });
            })
            .on("error", (error) => {
                fs.unlinkSync(req.file.path);
                res.status(500).json({ message: "Error parsing CSV file", error: error.message });
            });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Upload centers from CSV
export const uploadCentersFromCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const results = [];
        const errors = [];

        // Parse CSV file
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on("data", (data) => results.push(data))
            .on("end", async () => {
                // Process each row
                for (let i = 0; i < results.length; i++) {
                    const row = results[i];
                    try {
                        const { centerCode, centerName, state, city } = row;

                        // Validate required fields
                        if (!centerCode || !centerName || !state || !city) {
                            errors.push(`Row ${i + 1}: Missing required fields`);
                            continue;
                        }

                        // Find or create state
                        let stateDoc = await State.findOne({ name: state });
                        if (!stateDoc) {
                            stateDoc = new State({
                                name: state
                            });
                            await stateDoc.save();
                        }

                        // Find or create city
                        let cityDoc = await City.findOne({ name: city, state: state });
                        if (!cityDoc) {
                            cityDoc = new City({
                                name: city,
                                state: state
                            });
                            await cityDoc.save();
                        }

                        // Check if center code already exists
                        const existingCenter = await Center.findOne({ centerCode });
                        if (existingCenter) {
                            errors.push(`Row ${i + 1}: Center with this code already exists`);
                            continue;
                        }

                        // Create new center
                        const newCenter = new Center({
                            centerCode,
                            centerName,
                            state,
                            city,
                            submittedBy: 'admin' // Add required field
                        });

                        await newCenter.save();
                    } catch (error) {
                        errors.push(`Row ${i + 1}: ${error.message}`);
                    }
                }

                // Delete temporary file
                fs.unlinkSync(req.file.path);

                res.json({
                    message: "CSV processing completed",
                    totalRows: results.length,
                    successful: results.length - errors.length,
                    errors
                });
            })
            .on("error", (error) => {
                fs.unlinkSync(req.file.path);
                res.status(500).json({ message: "Error parsing CSV file", error: error.message });
            });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};