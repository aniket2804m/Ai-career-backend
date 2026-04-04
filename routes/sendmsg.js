import express from "express";
const router = express.Router();
import nodemailer from "nodemailer";

// -- Nodemailer transporter steup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// -- Post /api/sendmsg route
router.post("/", async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if(!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email, subject or message required "
            });
        }

        // -- Email options
        const mailOptions = {
            from: `"${name}" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `New Message from ${name}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">
            New Message Received
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
              <td style="padding: 10px 0; color: #64748b;"><strong>Subject:</strong></td>
              <td style="padding: 10px 0; color: #0f172a;">${subject}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 10px; color: #64748b; vertical-align: top;"><strong>Message:</strong></td>
              <td style="padding: 10px; color: #0f172a; line-height: 1.6;">
                ${message || "Koi message nahi diya."}
              </td>
            </tr>
          </table>

        </div>
      `,

      

        }

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
        })

    }

    catch (err) {
        console.error("Email error:", err);
        res.status(500).json({ message: "Server error"});
    }
})

export default router;