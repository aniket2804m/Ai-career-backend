import express from "express";
import Institute from "../models/institute.model.js";

const router = express.Router();

router.post("/search", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Query required" });

  try {
    const dbData = await Institute.findOne({
      name: { $regex: query, $options: "i" },
    });

    // ✅ AI nahi — smart fallback logic
    const scamKeywords = ["guarantee", "guaranteed", "100%", "assured", "definitely"];
    const queryLower = query.toLowerCase();
    const hasScamWords = scamKeywords.some(k => queryLower.includes(k));

    const verdict = dbData?.verdict || (hasScamWords ? "scam" : "suspicious");

    const aiAnalysis = {
      verdict,
      confidence: dbData ? 85 : 60,
      redFlags: dbData?.redFlags?.length > 0 ? dbData.redFlags : [
        "100% placement guarantee — ye legally invalid claim hai",
        "Hidden fees admission ke baad aa sakti hain",
        "Fake testimonials common hain — verify karo",
        "Pressure tactics — 'kal tak hi offer hai' — red flag hai",
      ],
      greenFlags: dbData?.greenFlags?.length > 0 ? dbData.greenFlags : [
        "Alumni se directly baat karo",
        "Curriculum publicly available hai to good sign hai",
      ],
      advice: `"${query}" ke baare mein join karne se pehle — alumni se LinkedIn pe baat karo, refund policy likha le, aur curriculum verify karo. Koi bhi 'guaranteed placement' claim kare to seedha na kaho.`,
      questionsToAsk: [
        "Kya aap 5 recent alumni ke LinkedIn profiles de sakte ho?",
        "Last batch ka actual placement percentage kya tha — proof ke saath?",
        "Refund policy kya hai agar placement nahi mili?",
        "Curriculum mein exactly kya cover hoga — syllabus do?",
        "Kya fees ki koi hidden charges hain baad mein?",
      ],
    };

    let institute = dbData;
    if (!institute) {
      institute = await Institute.create({
        name: query,
        verdict: aiAnalysis.verdict,
        redFlags: aiAnalysis.redFlags,
        greenFlags: aiAnalysis.greenFlags,
      });
    }

    return res.json({
      dbData: institute,
      aiAnalysis,
      finalVerdict: dbData?.verdict || aiAnalysis.verdict,
    });

  } catch (err) {
    console.error("Search error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;