import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    instituteId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Institute" 
    },
    studentCity: String,
    courseTaken: String,
    feePaid: Number,
    overallRating: { type: Number, min: 1, max: 5 },
    teachingQuality: { type: Number, min: 1, max: 5 },
    placementSupport: { type: Number, min: 1, max: 5 },
    valueForMoney: { type: Number, min: 1, max: 5 },
    review: String,
    gotPlaced: { type: String, enum: ["yes", "no", "self"] },
    actualSalary: Number,
    promisedSalary: Number,
    flags: [String],
    isAnonymous: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ✅ ESM mein ye zaroori hai
const Reviews = mongoose.model("Reviews", reviewSchema);
export default Reviews;