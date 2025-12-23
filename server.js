import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import stateRoutes from "./routes/stateRoutes.js";
import cityRoutes from "./routes/cityRoutes.js";
import centerRoutes from "./routes/centerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import mediaRoutes from './routes/mediaRoutes.js';
import userSubmissionRoutes from './routes/userSubmissionRoutes.js';

/* =========================
   ENV & DATABASE
========================= */
dotenv.config();
connectDB();

/* =========================
   APP INIT
========================= */
const app = express();

/* =========================
   MIDDLEWARE
========================= */

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // For development, allow localhost origins
    const allowedOrigins = [
      'http://localhost:8081',  // Expo web default
      'http://localhost:19006', // Expo default
      'http://localhost:19000', // Expo default
      'http://localhost:3000',  // Common React dev server
      'http://localhost:3001',  // Alternative React dev server
      'exp://localhost:19000',  // Expo app
      'exp://127.0.0.1:19000',  // Expo app alternative
      'https://center-mgt.onrender.com', // Production Render URL
      'https://center-mgt-1.onrender.com'  // Alternative Render URL
    ];

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Parse JSON body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

/* =========================
   ROUTES
========================= */
app.use("/upload", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/states", stateRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/centers", centerRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/user-submissions', userSubmissionRoutes);

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
