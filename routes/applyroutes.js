import express from "express";
const router = express.Router();
import nodemailer from "nodemailer";
import multer from "multer";

// ── Multer — resume memory mein store karo (file system nahi) ──
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Sirf PDF ya DOC file allow hai."));
  },
});

// ── Nodemailer transporter ──────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // tumhara Gmail
    pass: process.env.EMAIL_PASS, // Gmail App Password (neeche instructions hain)
  },
});

// ── POST /api/apply ─────────────────────────────────────────
router.post("/", upload.single("resume"), async (req, res) => {
  try {
    const { name, email, role, message } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ message: "Name, email aur role required hai." });
    }

    // ── Email options ──
    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // same email pe receive hoga
      replyTo: email,             // reply karo toh applicant ko jaayega
      subject: `New Job Application — ${role}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">
            New Job Application Received
          </h2>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #64748b; width: 120px;"><strong>Name:</strong></td>
              <td style="padding: 10px 0; color: #0f172a;">${name}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 10px; color: #64748b;"><strong>Email:</strong></td>
              <td style="padding: 10px; color: #0f172a;">
                <a href="mailto:${email}" style="color: #6366f1;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b;"><strong>Role:</strong></td>
              <td style="padding: 10px 0; color: #0f172a;">${role}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 10px; color: #64748b; vertical-align: top;"><strong>Message:</strong></td>
              <td style="padding: 10px; color: #0f172a; line-height: 1.6;">
                ${message || "Koi message nahi diya."}
              </td>
            </tr>
          </table>

          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
            Resume attachment dekho neeche. Reply karo toh seedha applicant ko jaayega.
          </p>
        </div>
      `,
      // Resume attachment
      attachments: req.file
        ? [
            {
              filename: req.file.originalname,
              content: req.file.buffer,
              contentType: req.file.mimetype,
            },
          ]
        : [],
    };

    await transporter.sendMail(mailOptions);

    // ── Applicant ko confirmation email ──
    await transporter.sendMail({
      from: `"Careers Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Application Received — ${role}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Application Received! 🎉</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Tumhari application <strong>${role}</strong> role ke liye receive ho gayi hai.</p>
          <p>Hum jald hi tumse contact karenge.</p>
          <br/>
          <p style="color: #64748b; font-size: 13px;">— Careers Team</p>
        </div>
      `,
    });

    res.json({ success: true, message: "Application send ho gayi!" });

  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ message: "Email send nahi hua. Server check karo." });
  }
});

export default router;