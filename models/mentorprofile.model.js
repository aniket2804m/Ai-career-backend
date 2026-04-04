
import mongoose from "mongoose";

const mentorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["mentor", "mentee"],
      required: true,
    },
    skill: {
      type: String,
      required: true,
      // e.g. "Web Development", "Python", "DSA"
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    hoursPerWeek: {
      type: Number,
      required: true, // kitna time de sakte ho
    },
    bio: {
      type: String,
      default: "",
      maxlength: 300,
    },
    isAvailable: {
      type: Boolean,
      default: true, // group mein join karne ke liye available hai?
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MentorGroup",
      default: null, // null means abhi kisi group mein nahi
    },
  },
  { timestamps: true }
);

const MentorProfile = mongoose.model("MentorProfile", mentorProfileSchema);
export default MentorProfile;