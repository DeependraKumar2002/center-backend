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

// Only connect to DB, don't run seed data automatically
connectDB();

/* =========================
   APP INIT
========================= */
const app = express();

/* =========================
   MIDDLEWARE
========================= */
const corsOptions = {
  origin: '*', // Allow all origins without restrictions
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: true, // Allow credentials to be included
  optionsSuccessStatus: 200,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Content-Length", "X-Content-Type-Options"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
};

app.use(cors(corsOptions));

// Additional middleware to ensure CORS headers are present even in error scenarios
app.use((req, res, next) => {
  // Set CORS headers for all requests
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Content-Length, X-Content-Type-Options');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Apply body parsing middleware only to non-upload routes to avoid conflicts with multer
app.use((req, res, next) => {
  // Skip JSON and URL-encoded parsing for upload routes to avoid conflicts with multer
  if (req.url.includes('/media/upload') || req.url.includes('/upload')) {
    next();
  } else {
    express.json({ limit: '200mb' })(req, res, (err) => {
      if (err) return next(err);
      express.urlencoded({ extended: true, limit: '200mb' })(req, res, next);
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
app.use('/api/media', (req, res, next) => {
  // Increase timeout for any media-related routes
  req.setTimeout(1800000); // 30 minutes for upload
  res.setTimeout(1800000); // 30 minutes for upload response
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

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

// Global error handling middleware - must be defined after routes
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Ensure CORS headers are set for error responses
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Content-Length, X-Content-Type-Options');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');

  // Prevent HTML error pages from being returned
  if (req.url.includes('/api/')) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  } else {
    // For non-API routes, you might want to return HTML
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error',
      error: 'API Error'
    });
  }
});

/* =========================
   SERVER - Keep alive mechanism
========================= */
const PORT = process.env.PORT || 5000;

// Remove the keep-alive mechanism that was causing issues
// Instead, implement a simple HTTP keep-alive at the server level
app.use((req, res, next) => {
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Keep-Alive', 'timeout=60, max=1000');
  next();
});

// Increase timeout settings for long-running requests
app.use((req, res, next) => {
  req.setTimeout(1800000); // 30 minutes
  res.setTimeout(1800000); // 30 minutes
  next();
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Server URL: http://localhost:${PORT}`);
});

// Set server timeout for idle connections
server.timeout = 1800000; // 30 minutes

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

// Keep the process alive by sending periodic HTTP requests to itself
// This prevents Render from putting the server to sleep
setInterval(async () => {
  try {
    const response = await fetch(`http://localhost:${PORT}/ping`);
    const data = await response.json();
    console.log('Self-ping successful:', data.status);
  } catch (error) {
    console.log('Self-ping failed:', error.message);
  }
}, 280000); // Every ~4.5 minutes (under the 5-minute timeout)

// Keep the process alive even if no connections
process.stdin.resume();