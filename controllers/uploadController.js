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

    response.data
      .pipe(csv())
      .on("data", (row) => {
        if (row.username && row.password) {
          users.push(row);
        }
      })
      .on("end", async () => {
        for (const u of users) {
          const hashedPassword = await bcrypt.hash(u.password, 10);

          await User.findOneAndUpdate(
            { username: u.username },
            { password: hashedPassword, email: u.email || '' },
            { upsert: true }
          );
        }

        res.json({
          message: "Users CSV uploaded & saved successfully",
          totalUsers: users.length,
          cloudinaryUrl: csvUrl,
        });
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

    response.data
      .pipe(csv())
      .on("data", (row) => {
        if (row.centerCode && row.centerName && row.state && row.city) {
          centers.push(row);
        }
      })
      .on("end", async () => {
        // Insert centers
        await Center.insertMany(centers, { ordered: false });

        res.json({
          message: "Centers CSV uploaded & saved successfully",
          totalCenters: centers.length,
          cloudinaryUrl: csvUrl,
        });
      });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export { uploadUsersCSV, uploadCentersCSV };