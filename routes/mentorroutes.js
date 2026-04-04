import express from "express";
const router = express.Router();
import MentorProfile from "../models/mentorprofile.js";
import MentorGroup from "../models/mentorgroup.js";
import authMiddleware from "../middleware/verifyToken.js";


// ─────────────────────────────────────────────
// POST /api/mentor/profile — apna profile banao ya update karo
// ─────────────────────────────────────────────
router.post("/profile", authMiddleware, async (req, res) => {
  try {
    const { role, skill, level, hoursPerWeek, bio } = req.body;

    if (!role || !skill || !level || !hoursPerWeek) {
      return res.status(400).json({ message: "Saare fields required hain." });
    }

    // Agar pehle se profile hai toh update karo
    let profile = await MentorProfile.findOne({ user: req.user.id });

    if (profile) {
      profile.role = role;
      profile.skill = skill;
      profile.level = level;
      profile.hoursPerWeek = hoursPerWeek;
      profile.bio = bio || "";
      await profile.save();
      return res.json({ message: "Profile update ho gaya!", profile });
    }

    // Naya profile banao
    profile = await MentorProfile.create({
      user: req.user.id,
      role,
      skill,
      level,
      hoursPerWeek,
      bio: bio || "",
    });

    res.status(201).json({ message: "Profile ban gaya!", profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

// ─────────────────────────────────────────────
// GET /api/mentor/profile/me — apna profile dekho
// ─────────────────────────────────────────────
router.get("/profile/me", authMiddleware, async (req, res) => {
  try {
    const profile = await MentorProfile.findOne({ user: req.user.id })
      .populate("user", "name email")
      .populate("group");

    if (!profile) {
      return res.status(404).json({ message: "Profile nahi bana abhi tak." });
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ─────────────────────────────────────────────
// GET /api/mentor/browse — available mentors dekho
// ─────────────────────────────────────────────
router.get("/browse", authMiddleware, async (req, res) => {
  try {
    const { skill } = req.query;

    const filter = {
      role: "mentor",
      isAvailable: true,
    };

    if (skill) filter.skill = skill;

    const mentors = await MentorProfile.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(mentors);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ─────────────────────────────────────────────
// POST /api/mentor/join/:mentorUserId — mentor ke group mein join karo
// ─────────────────────────────────────────────
router.post("/join/:mentorUserId", authMiddleware, async (req, res) => {
  try {
    const menteeProfile = await MentorProfile.findOne({ user: req.user.id });

    // Validations
    if (!menteeProfile) {
      return res.status(400).json({ message: "Pehle apna profile banao." });
    }
    if (menteeProfile.role !== "mentee") {
      return res.status(400).json({ message: "Sirf mentee hi join kar sakta hai." });
    }
    if (menteeProfile.group) {
      return res.status(400).json({ message: "Tum already ek group mein ho." });
    }

    const mentorProfile = await MentorProfile.findOne({
      user: req.params.mentorUserId,
      role: "mentor",
    });

    if (!mentorProfile || !mentorProfile.isAvailable) {
      return res.status(404).json({ message: "Mentor nahi mila ya available nahi hai." });
    }

    // Skill match check
    if (mentorProfile.skill !== menteeProfile.skill) {
      return res.status(400).json({
        message: `Skill mismatch! Mentor ${mentorProfile.skill} sikhata hai, tumhara skill ${menteeProfile.skill} hai.`,
      });
    }

    // Existing open group check
    let group = await MentorGroup.findOne({
      mentor: req.params.mentorUserId,
      isOpen: true,
    });

    if (!group) {
      // Naya group banao
      group = await MentorGroup.create({
        skill: mentorProfile.skill,
        mentor: req.params.mentorUserId,
        mentees: [req.user.id],
      });
      mentorProfile.group = group._id;
      await mentorProfile.save();
    } else {
      // Group mein add karo
      if (group.mentees.length >= 4) {
        group.isOpen = false;
        await group.save();
        mentorProfile.isAvailable = false;
        await mentorProfile.save();
        return res.status(400).json({ message: "Group full ho gaya (max 5 log)." });
      }
      group.mentees.push(req.user.id);
      if (group.mentees.length >= 4) {
        group.isOpen = false;
        mentorProfile.isAvailable = false;
        await mentorProfile.save();
      }
      await group.save();
    }

    // Mentee ka group update karo
    menteeProfile.group = group._id;
    await menteeProfile.save();

    res.json({ message: "Group mein join ho gaye!", groupId: group._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

// ─────────────────────────────────────────────
// GET /api/mentor/group — apna group dekho
// ─────────────────────────────────────────────
router.get("/group", authMiddleware, async (req, res) => {
  try {
    const profile = await MentorProfile.findOne({ user: req.user.id });

    if (!profile || !profile.group) {
      return res.status(404).json({ message: "Abhi kisi group mein nahi ho." });
    }

    const group = await MentorGroup.findById(profile.group)
      .populate("mentor", "name email")
      .populate("mentees", "name email");

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/mentor/group/goal — weekly goal set karo (mentor only)
// ─────────────────────────────────────────────
router.patch("/group/goal", authMiddleware, async (req, res) => {
  try {
    const { weeklyGoal } = req.body;
    const group = await MentorGroup.findOne({ mentor: req.user.id });

    if (!group) {
      return res.status(404).json({ message: "Tumhara group nahi mila." });
    }

    group.weeklyGoal = weeklyGoal;
    await group.save();

    res.json({ message: "Weekly goal set ho gaya!", weeklyGoal });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

export default router;