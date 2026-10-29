const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const accommodationRoutes = require("./routes/accommodationRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Ensure database connection is active before processing API requests (essential for serverless)
app.use("/api", async (req, res, next) => {
  if (req.path === "/health") {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection failed for request:", err.message);
    res.status(500).json({
      message: "Database connection failed",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/accommodations", accommodationRoutes);
app.use("/api/bookings", bookingRoutes);

// Health check / welcome endpoint
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Boarding Finder API is running smoothly",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
  });
});

// 404 Route handler for undefined API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "An unexpected internal server error occurred",
  });
});

// Catch unexpected process-level errors to ensure backend server never crashes
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

const PORT = process.env.PORT || 5000;

// Connect to Database and start server for local development
if (process.env.VERCEL !== "1" && require.main === module) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`✓ Boarding Finder Backend server listening on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      // Start server even if MongoDB Atlas has a temporary IP issue so health check & APIs respond with proper error
      console.warn("Server starting in standby mode while waiting for database connection...");
      app.listen(PORT, () => {
        console.log(`✓ Boarding Finder Backend server listening on http://localhost:${PORT}`);
      });
    });
}

module.exports = app;