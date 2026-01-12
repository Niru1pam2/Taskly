import express from "express";
import { z } from "zod";

import { validateRequest } from "zod-express-middleware";
import {
  disable2FA,
  generateF2FASecret,
  loginUser,
  logoutUser,
  registerUser,
  resetPasswordRequest,
  validate2FALogin,
  verifyAndEnable2FA,
  verifyEmail,
  verifyResetPasswordTokenAndResetPassword,
} from "../controllers/authController.js";
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../libs/validateSchema.js";
import { authMiddleware } from "../middleware/auth-middleware.js";

const router = express.Router();

router.post(
  "/register",
  validateRequest({
    body: registerSchema,
  }),
  registerUser
);

router.post(
  "/login",
  validateRequest({
    body: loginSchema,
  }),
  loginUser
);

router.post("/logout", logoutUser);

router.post(
  "/verify-email",
  validateRequest({
    body: verifyEmailSchema,
  }),
  verifyEmail
);

router.post(
  "/reset-password-request",
  validateRequest({
    email: z.string().email(),
  }),
  resetPasswordRequest
);

router.post(
  "/reset-password",
  validateRequest({
    body: resetPasswordSchema,
  }),
  verifyResetPasswordTokenAndResetPassword
);

router.post("/2fa/generate", authMiddleware, generateF2FASecret);

router.post(
  "/2fa/verify",
  authMiddleware,
  validateRequest({
    body: z.object({
      token: z.string(),
      secret: z.string(),
    }),
  }),
  verifyAndEnable2FA
);

router.post("/2fa/disable", authMiddleware, disable2FA);

router.post(
  "/2fa/validate",
  validateRequest({
    body: z.object({
      userId: z.string(),
      token: z.string(),
    }),
  }),
  validate2FALogin
);

export default router;
