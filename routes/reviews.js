// backend/routes/reviews.js

import express from "express";

import Review from "../models/review.js";
import Institute from "../models/institute.js";


const router = express.Router()

router.post('/review', async (req, res) => {
  const review = await Review.create(req.body)
  
  // Institute ka avg rating update karo
  const allReviews = await Review.find({ 
    instituteId: req.body.instituteId 
  })
  const avg = allReviews.reduce((sum, r) => 
    sum + r.overallRating, 0) / allReviews.length
  
  await Institute.findByIdAndUpdate(req.body.instituteId, {
    avgRating: avg.toFixed(1),
    totalReviews: allReviews.length
  })
  
  res.json({ success: true, review })
})

export default router;