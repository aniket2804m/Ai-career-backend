import express from 'express';
const router = express.Router();
import verifyToken from '../middleware/verifyToken.js';
import { isAdmin } from '../middleware/authorizeRole.js';

import {
  createQuiz,
  getQuizByCourse,
  submitQuiz,
  getAllResults,
  getResultsByCourse,
  getAllQuizzes,
} from '../controllers/quizController.js';

// ── USER ROUTES ─────────────────────────────────────
router.get('/course/:courseId', verifyToken, getQuizByCourse);
router.post('/submit', verifyToken, submitQuiz);

// ── ADMIN ROUTES ────────────────────────────────────
router.post('/create', verifyToken, isAdmin, createQuiz);
router.get('/results', verifyToken, isAdmin, getAllResults);
router.get('/results/course/:courseId', verifyToken, isAdmin, getResultsByCourse);
router.get('/all', verifyToken, isAdmin, getAllQuizzes);

export default router;
