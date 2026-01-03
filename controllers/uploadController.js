import csv from "csv-parser";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Center from "../models/Center.js";
import axios from "axios";
// Upload users CSV
const uploadUsersCSV = async (req, res) => {
  try {
    // ✅ safety check
    if (!req.file) {
      return res.status(400).json({ message: "CSV file required" });
    }

    const csvUrl = req.file.path; // Cloudinary URL

    const response = await axios.get(csvUrl, {
      responseType: "stream",
    });

    const users = [];

    // Promisify the CSV stream processing
    await new Promise((resolve, reject) => {
      let csvError = null;

      response.data
        .pipe(csv())
        .on("data", (row) => {
          try {
            if (row.username && row.password) {
              // Map CSV row to User model structure
              const userData = {
                username: row.username,
                password: row.password,
                email: row.email || `${row.username}@gmail.com` // Default email if not provided
              };
              users.push(userData);
            }
          } catch (error) {
            csvError = error;
            reject(error);
          }
        })
        .on("end", () => {
          if (csvError) {
            reject(csvError);
          } else {
            resolve();
          }
        })
        .on("error", (error) => {
          console.error('CSV stream error:', error);
          csvError = error;
          reject(error);
        });
    });

    // Process users after CSV parsing is complete
    for (const u of users) {
      const hashedPassword = await bcrypt.hash(u.password, 10);

      await User.findOneAndUpdate(
        { username: u.username },
        { password: hashedPassword, email: u.email },
        { upsert: true }
      );
    }

    res.json({
      message: "Users CSV uploaded & saved successfully",
      totalUsers: users.length,
      cloudinaryUrl: csvUrl,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Upload centers CSV
const uploadCentersCSV = async (req, res) => {
  try {
    // ✅ safety check
    if (!req.file) {
      return res.status(400).json({ message: "CSV file required" });
    }

    const csvUrl = req.file.path; // Cloudinary URL

    const response = await axios.get(csvUrl, {
      responseType: "stream",
    });

    const centers = [];

    // Promisify the CSV stream processing
    await new Promise((resolve, reject) => {
      let csvError = null;

      response.data
        .pipe(csv())
        .on("data", (row) => {
          try {
            if (row.centerCode && row.centerName && row.state && row.city) {
              // Map CSV row to Center model structure
              const centerData = {
                centerCode: row.centerCode,
                centerName: row.centerName,
                state: row.state,
                city: row.city,
                submittedBy: row.submittedBy || 'admin', // Default to 'admin' if not provided
                biometricDeskCount: row.biometricDeskCount || '',
                location: {
                  coordinates: row.longitude && row.latitude ?
                    [parseFloat(row.longitude), parseFloat(row.latitude)] : null, // Use null instead of default coordinates
                  address: row.address || ''
                }
              };
              centers.push(centerData);
            }
          } catch (error) {
            csvError = error;
            reject(error);
          }
        })
        .on("end", () => {
          if (csvError) {
            reject(csvError);
          } else {
            resolve();
          }
        })
        .on("error", (error) => {
          console.error('CSV stream error:', error);
          csvError = error;
          reject(error);
        });
    });

    // Process centers after CSV parsing is complete
    if (centers.length > 0) {
      // Insert centers
      await Center.insertMany(centers, { ordered: false });
    }

    res.json({
      message: "Centers CSV uploaded & saved successfully",
      totalCenters: centers.length,
      cloudinaryUrl: csvUrl,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export { uploadUsersCSV, uploadCentersCSV };