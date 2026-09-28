import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/passwordReset.validator.js";

import {
  requestPasswordReset,
  resetPassword,
} from "../services/passwordReset.service.js";

export async function forgotPassword(req, res) {
  const { email } = forgotPasswordSchema.parse(req.body);

  await requestPasswordReset(email);

  return res.json({
    success: true,
    message:
      "If an account exists with that email, a password reset link has been sent.",
  });
}

export async function resetPasswordController(req, res) {
  const { token, password } = resetPasswordSchema.parse(req.body);

  await resetPassword(token, password);

  return res.json({
    success: true,
    message: "Password reset successfully.",
  });
}

console.log("passwordReset.controller.js loaded");
console.log("forgotPassword:", typeof forgotPassword);
console.log(
  "resetPasswordController:",
  typeof resetPasswordController
);