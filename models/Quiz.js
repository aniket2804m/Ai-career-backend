// models/Quiz.js
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  type: { type: String, enum: ["mcq", "truefalse"], required: true },

  // MCQ ke liye 4 options
  options: [{ type: String }],

  // Sahi answer
  correctAnswer: { type: String, required: true },
});

const quizSchema = new mongoose.Schema({
  course:      { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  title:       { type: String, required: true },
  duration:    { type: Number, default: 10 }, // Minutes mein
  passingScore:{ type: Number, default: 60 }, // Percentage mein
  questions:   [questionSchema],
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;