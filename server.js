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

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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



app.get("/", (req, res) => res.json({ message: "Server is running ✅" }));

mongoose
  .connect(process.env.MONGO_URL)   // ✅ MONGO_URI → MONGO_URL
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB Error:", err.message));