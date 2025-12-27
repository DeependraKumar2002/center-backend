import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fetch from 'node-fetch';

import connectDB from "./config/db.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import stateRoutes from "./routes/stateRoutes.js";
import cityRoutes from "./routes/cityRoutes.js";
import centerRoutes from "./routes/centerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import mediaRoutes from './routes/mediaRoutes.js';
import userSubmissionRoutes from './routes/userSubmissionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';

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
  origin: process.env.CORS_ORIGIN || '*', // Allow specific origin in production if needed
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: false, // Set to false when allowing all origins
  optionsSuccessStatus: 200,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Content-Length", "X-Content-Type-Options"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
};

app.use(cors(corsOptions));

// Apply body parsing middleware only to non-upload routes to avoid conflicts with multer
app.use((req, res, next) => {
  // Skip JSON and URL-encoded parsing for upload routes to avoid conflicts with multer
  if (req.url.includes('/media/upload') || req.url.includes('/upload')) {
    next();
  } else {
    express.json({ limit: '50mb' })(req, res, (err) => {
      if (err) return next(err);
      express.urlencoded({ extended: true, limit: '50mb' })(req, res, next);
    });
  }
});

/* =========================
   HEALTH CHECK - Defined before routes to ensure accessibility
========================= */
// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// Keep server alive with ping endpoint
app.get('/ping', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Additional health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint for media upload connectivity
app.post('/test-upload', (req, res) => {
  res.status(200).json({
    status: 'upload endpoint accessible',
    message: 'Upload endpoint is working properly',
    timestamp: new Date().toISOString()
  });
});

/* =========================
   ROUTES
========================= */
// Increase timeout specifically for media upload routes to handle large files
app.use('/api/media/upload', (req, res, next) => {
  req.setTimeout(600000); // 10 minutes for upload
  res.setTimeout(600000); // 10 minutes for upload response
  next();
});

app.use("/upload", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/states", stateRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/centers", centerRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/user-submissions', userSubmissionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin-auth', adminAuthRoutes);

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 5000;

// Keep-alive mechanism for platforms like Render
// Ping the server to keep it awake more frequently
if (process.env.NODE_ENV === 'production') {
  // Use the actual external URL for production environments
  setInterval(() => {
    const serverUrl = process.env.RENDER_EXTERNAL_URL || `https://center-mgt-1.onrender.com`;
    if (serverUrl) {
      fetch(`${serverUrl}/ping`)
        .then(() => console.log('External ping successful - server kept alive'))
        .catch(err => console.log('External ping failed:', err.message));
    }
  }, 5 * 60 * 1000); // Ping every 5 minutes (more aggressive)
}

// Increase timeout settings for long-running requests
app.use((req, res, next) => {
  req.setTimeout(600000); // 10 minutes
  res.setTimeout(600000); // 10 minutes
  next();
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Server URL: http://localhost:${PORT}`);
});

// Set server timeout for idle connections
server.timeout = 600000; // 10 minutes

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});