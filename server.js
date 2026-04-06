import dotenv from "dotenv";
dotenv.config();          // ✅ Sabse pehle

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import listingRoutes from "./routes/Listing.js";
import reviewRoutes from "./routes/review.js";
import userRoutes from "./routes/user.js";
import adminRoutes from "./routes/adminRoutes.js";
import userDashboardRoutes from "./routes/userDashboardRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import searchRouter from "./routes/search.js";
import reviewRouter from "./routes/reviews.js";
import roadmapRouter from "./routes/roadmap.js";
import mentorRouter from "./routes/mentorroutes.js";
import applyRoutes from "./routes/applyroutes.js";
import sendmsgRoutes from "./routes/sendmsg.js";
import claudeRouter from "./routes/claude.js";

const app = express();

// ==========================================
// 🔧 CORS CONFIGURATION (RENDER-READY)
// ==========================================
// ✅ Development aur Production dono ke liye

const allowedOrigins = [
  "http://localhost:5173",        // Local development
  "http://localhost:3000",        // Backup local
  process.env.FRONTEND_URL,       // Production frontend URL
  // Render par ye environment variable set karenge
];

app.use(cors({ 
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked: ${origin}`);
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ==========================================
// 📍 ROUTES
// ==========================================
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userDashboardRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api", searchRouter);   // → /api/search
app.use("/api", reviewRouter);   // → /api/reviews
app.use("/api/roadmap", roadmapRouter);
app.use("/api/mentor", mentorRouter);
app.use("/api/apply", applyRoutes);
app.use("/api/sendmsg", sendmsgRoutes);
app.use("/api/claude", claudeRouter);

// ==========================================
// HEALTH CHECK ROUTES
// ==========================================
app.get("/", (req, res) => {
  res.json({ 
    message: "Server is running ✅",
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check for monitoring
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date()
  });
});

// ==========================================
// 404 - NOT FOUND
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path
  });
});

// ==========================================
// ERROR HANDLING MIDDLEWARE
// ==========================================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error"
  });
});

// ==========================================
// DATABASE CONNECTION
// ==========================================
const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI;
    
    if (!mongoUrl) {
      throw new Error("❌ MONGO_URL environment variable not set!");
    }

    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ MongoDB Connected Successfully!");
    return true;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    return false;
  }
};

// ==========================================
// SERVER START
// ==========================================
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

let server;

const startServer = async () => {
  const dbConnected = await connectDB();
  
  if (!dbConnected && NODE_ENV === "production") {
    console.error("❌ Cannot start server without database connection in production!");
    process.exit(1);
  }

  server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`
╔════════════════════════════════════╗
║   🚀 SERVER STARTED SUCCESSFULLY   ║
║   Port: ${PORT}
║   Environment: ${NODE_ENV}
║   URL: http://localhost:${PORT}
║   MongoDB: ${mongoose.connection.readyState === 1 ? "✅ Connected" : "⚠️  Connecting..."}
╚════════════════════════════════════╝
    `);
  });
};

startServer();

// ==========================================
// GRACEFUL SHUTDOWN (RENDER KE LIYE IMPORTANT)
// ==========================================

process.on("SIGTERM", () => {
  console.log("📋 SIGTERM received: Closing server gracefully...");
  if (server) {
    server.close(() => {
      console.log("✅ HTTP server closed");
      mongoose.connection.close(false, () => {
        console.log("✅ MongoDB connection closed");
        process.exit(0);
      });
    });
  }
});

process.on("SIGINT", () => {
  console.log("📋 SIGINT received: Closing server gracefully...");
  if (server) {
    server.close(() => {
      console.log("✅ HTTP server closed");
      mongoose.connection.close(false, () => {
        console.log("✅ MongoDB connection closed");
        process.exit(0);
      });
    });
  }
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

export default app;