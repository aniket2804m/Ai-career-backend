
import mongoose from "mongoose";

const mentorGroupSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      required: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ], // max 4 mentees (mentor + 4 = 5 log total)
    isOpen: {
      type: Boolean,
      default: true, // group full hone par false ho jaayega
    },
    weeklyGoal: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const MentorGroup = mongoose.model("MentorGroup", mentorGroupSchema);
export default MentorGroup;