// controllers/quizController.js
import Quiz from "../models/Quiz.js";
import QuizResult from "../models/QuizResult.js";

// ─── ADMIN — Quiz banao ──────────────────────────────────

// POST /api/quiz/create
export const createQuiz = async (req, res) => {
  try {
    const { course, title, duration, passingScore, questions } = req.body;

    if (!course || !title || !questions || questions.length === 0)
      return res.status(400).json({ message: "Course, title aur questions required hain" });

    const quiz = await Quiz.create({
      course, title, duration, passingScore, questions,
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Quiz created successfully", quiz });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// GET /api/quiz/course/:courseId — Course ka quiz lo
export const getQuizByCourse = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ course: req.params.courseId });
    if (!quiz) return res.status(404).json({ message: "Is course ka koi quiz nahi hai" });

    // User ko correct answer mat bhejo!
    const safeQuiz = {
      _id: quiz._id,
      title: quiz.title,
      duration: quiz.duration,
      passingScore: quiz.passingScore,
      questions: quiz.questions.map(q => ({
        _id: q._id,
        questionText: q.questionText,
        type: q.type,
        options: q.options,
        // correctAnswer nahi bheja ✅
      })),
    };

    res.json(safeQuiz);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ─── USER — Quiz Submit karo ─────────────────────────────

// POST /api/quiz/submit
export const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers, timeTaken } = req.body;
    // answers = [{ questionId, selectedAnswer }]

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz nahi mila" });

    // Pehle check karo — kya user ne already diya hai?
    const alreadyGiven = await QuizResult.findOne({
      quiz: quizId,
      user: req.user.id,
    });
    if (alreadyGiven)
      return res.status(400).json({ message: "Aapne ye quiz pehle de diya hai" });

    // Score calculate karo
    let correctCount = 0;
    const evaluatedAnswers = answers.map(ans => {
      const question = quiz.questions.id(ans.questionId);
      const isCorrect = question?.correctAnswer === ans.selectedAnswer;
      if (isCorrect) correctCount++;
      return {
        questionId: ans.questionId,
        selectedAnswer: ans.selectedAnswer,
        isCorrect,
      };
    });

    const percentage = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = percentage >= quiz.passingScore;

    // Result save karo
    const result = await QuizResult.create({
      quiz: quizId,
      course: quiz.course,
      user: req.user.id,
      score: correctCount,
      totalQuestions: quiz.questions.length,
      percentage,
      passed,
      timeTaken,
      answers: evaluatedAnswers,
    });

    res.status(201).json({
      message: passed ? "Congratulations! Quiz pass kar liya! 🎉" : "Quiz fail ho gaya. Dobara try karo!",
      score: correctCount,
      totalQuestions: quiz.questions.length,
      percentage,
      passed,
      timeTaken,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ─── ADMIN — Reports ─────────────────────────────────────

// GET /api/quiz/results — Sab results
export const getAllResults = async (req, res) => {
  try {
    const results = await QuizResult.find()
      .populate("user", "name email")
      .populate("course", "title")
      .populate("quiz", "title passingScore")
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// GET /api/quiz/results/course/:courseId — Course wise results
export const getResultsByCourse = async (req, res) => {
  try {
    const results = await QuizResult.find({ course: req.params.courseId })
      .populate("user", "name email")
      .populate("quiz", "title passingScore")
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// GET /api/quiz/all — Admin ke liye sab quizzes
export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate("course", "title")
      .sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};