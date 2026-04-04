import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    courseId: String,
    userName: String,
    rating: Number,
    comment: String
  },
  {
    timestamps: true
  }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;