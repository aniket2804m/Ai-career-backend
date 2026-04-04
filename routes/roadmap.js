
import express from "express";
const router   = express.Router();
// const Anthropic = require('@anthropic-ai/sdk');

import Roadmap from "../models/roadmap.js";

// ✅ Client ek baar banao — har request pe nahi
// const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/roadmap
router.post('/', async (req, res) => {
  try {
    const { topic, hours, level, goal } = req.body;

    // ─── 1. Input Validation ───────────────────────────────────────────────
    if (!topic || !hours || !level || !goal) {
      return res.status(400).json({
        success: false,
        message: 'Saare fields required hain: topic, hours, level, goal',
      });
    }

    const validLevels = ['beginner', 'intermediate', 'advanced'];
    if (!validLevels.includes(level)) {
      return res.status(400).json({
        success: false,
        message: `Level sirf in mein se hona chahiye: ${validLevels.join(', ')}`,
      });
    }

    // ─── 2. Claude se Roadmap Generate ────────────────────────────────────
    const message = await client.messages.create({
      model:      'claude-opus-4-5',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: `
You are a helpful coding mentor for students in India who cannot afford paid courses.

Create a detailed 4-week FREE learning roadmap for:
- Topic: ${topic}
- Daily Time Available: ${hours} hours/day
- Level: ${level}
- Goal: ${goal}

STRICT RULES:
1. Use ONLY these free resources: YouTube, freeCodeCamp, MDN Web Docs, The Odin Project, CS50, Kaggle
2. NO paid courses, NO Udemy, NO Coursera paid content
3. Each day must have a specific topic + free resource link description
4. Keep it realistic for ${hours} hours/day

FORMAT (follow exactly):
WEEK 1: [Week Title]
  DAY 1: [Topic] → [Resource Name] (free)
  DAY 2: [Topic] → [Resource Name] (free)
  ...
  PROJECT: [Small hands-on project to build]

WEEK 2: ...
(continue for all 4 weeks)

FINAL PROJECT: [Capstone project idea]
          `.trim(),
        },
      ],
    });

    const roadmapText = message.content[0].text;

    // ─── 3. MongoDB mein Save ─────────────────────────────────────────────
    const saved = await Roadmap.create({ topic, hours, level, goal, roadmapText });

    // ─── 4. Success Response ──────────────────────────────────────────────
    return res.status(201).json({
      success: true,
      message: 'Roadmap successfully ban gaya!',
      data: {
        id:          saved._id,
        topic:       saved.topic,
        hours:       saved.hours,
        level:       saved.level,
        goal:        saved.goal,
        roadmapText: saved.roadmapText,
        createdAt:   saved.createdAt,
      },
    });

  } catch (error) {
    // ─── Claude API Error ─────────────────────────────────────────────────
    if (error?.status === 401) {
      return res.status(500).json({ success: false, message: 'Claude API key invalid hai. .env check karo.' });
    }
    if (error?.status === 429) {
      return res.status(429).json({ success: false, message: 'Claude API rate limit ho gaya. Thoda wait karo.' });
    }

    // ─── MongoDB Error ────────────────────────────────────────────────────
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }

    console.error('❌ Roadmap Route Error:', error);
    return res.status(500).json({ success: false, message: 'Server error. Console check karo.' });
  }
});

// GET /api/roadmap/:id  — ek specific roadmap fetch karo
router.get('/:id', async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap nahi mila.' });
    }
    return res.json({ success: true, data: roadmap });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/roadmap  — saare roadmaps (latest pehle)
router.get('/', async (req, res) => {
  try {
    const roadmaps = await Roadmap.find()
      .sort({ createdAt: -1 })
      .select('-roadmapText')   // list mein full text mat bhejo (bandwidth save)
      .limit(20);
    return res.json({ success: true, data: roadmaps });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

export default router;