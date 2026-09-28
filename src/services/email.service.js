import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: 465,
  secure: true,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPassword,
  },
});

export async function sendPasswordResetEmail({
  email,
  name,
  resetUrl,
}) {
  if (!email) {
    throw new Error("Password reset recipient email is missing.");
  }

  return transporter.sendMail({
    from: `"StudyTrack" <${env.smtpUser}>`,
    to: email,
    subject: "Reset your StudyTrack password",

    text: `Hi ${name || "there"},

You requested a password reset for your StudyTrack account.

Reset your password using this link:

${resetUrl}

This link will expire in 15 minutes.

If you did not request this password reset, you can safely ignore this email.

StudyTrack`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset your StudyTrack password</h2>

        <p>
          Hi ${name || "there"},
        </p>

        <p>
          You requested a password reset for your StudyTrack account.
        </p>

        <p>
          Click the button below to create a new password:
        </p>

        <p>
          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #4f46e5;
              color: white;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Reset Password
          </a>
        </p>

        <p>
          This link will expire in <strong>15 minutes</strong>.
        </p>

        <p>
          If you did not request this password reset, you can safely ignore
          this email.
        </p>

        <p>
          Thanks,<br />
          StudyTrack
        </p>
      </div>
    `,
  });
}