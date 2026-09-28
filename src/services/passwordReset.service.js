import crypto from "crypto";
import bcrypt from "bcryptjs";

import { User } from "../models/User.js";
import { sendPasswordResetEmail } from "./email.service.js";

const RESET_TOKEN_EXPIRY_MINUTES = 15;

export async function requestPasswordReset(email) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });

  /*
   * Don't reveal whether the email exists.
   */
  if (!user) {
    return;
  }

  /*
   * Generate a secure random token.
   */
  const rawToken = crypto.randomBytes(32).toString("hex");

  /*
   * Store only the hash in MongoDB.
   */
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const expiresAt = new Date(
    Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000
  );

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expiresAt,
      },
    }
  );

  const resetUrl =
    `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;

  await sendPasswordResetEmail({
    email: user.email,
    name: user.name,
    resetUrl,
  });
}

export async function resetPassword(token, newPassword) {
  if (!token) {
    const error = new Error("Invalid password reset token.");
    error.statusCode = 400;
    throw error;
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: new Date(),
    },
  }).select("+passwordHash +passwordResetToken +passwordResetExpires");

  if (!user) {
    const error = new Error(
      "Password reset link is invalid or has expired."
    );

    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  user.passwordHash = passwordHash;

  /*
   * Make the token unusable immediately.
   */
  user.passwordResetToken = null;
  user.passwordResetExpires = null;

  await user.save();
}