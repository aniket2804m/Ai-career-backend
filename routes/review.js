import express from "express";
import { createReview, getReview } from "../controllers/review.js";

const router = express.Router();

// Rotes
router.post("/creates", createReview);

// get route
router.get("/:courseId", getReview);

export default router;