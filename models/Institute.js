import mongoose from "mongoose";

const instituteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: String,
    category: String,
    verdict: {
      type: String,
      enum: ["legitimate", "suspicious", "scam"],
      default: "suspicious",
    },
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    teachingQuality: { type: Number, default: 0 },
    placementSupport: { type: Number, default: 0 },
    valueForMoney: { type: Number, default: 0 },
    redFlags: [String],
    greenFlags: [String],
    verifiedByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ ESM mein ye zaroori hai
const Institute = mongoose.model("Institute", instituteSchema);
export default Institute;