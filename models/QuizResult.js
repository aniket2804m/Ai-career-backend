// models/QuizResult.js
import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema({
  quiz:        { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  course:      { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  score:       { type: Number, required: true },       // Kitne sahi
  totalQuestions: { type: Number, required: true },    // Total questions
  percentage:  { type: Number, required: true },       // Score %
  passed:      { type: Boolean, required: true },      // Pass/Fail
  timeTaken:   { type: Number },                       // Seconds mein
  answers: [{                                          // User ne kya jawab diya
    questionId: mongoose.Schema.Types.ObjectId,
    selectedAnswer: String,
    isCorrect: Boolean,
  }],
}, { timestamps: true });

const QuizResult = mongoose.model("QuizResult", quizResultSchema);
export default QuizResult;