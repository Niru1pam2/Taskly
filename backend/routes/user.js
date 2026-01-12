import express from "express";
import { authMiddleware } from "../middleware/auth-middleware.js";
import {
  changePassword,
  deleteAccount,
  getUserProfile,
  updateUserProfile,
  uploadUserProfilePic,
} from "../controllers/userController.js";
import { validateRequest } from "zod-express-middleware";
import z from "zod";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/profile", authMiddleware, getUserProfile);
router.patch(
  "/profile",
  authMiddleware,
  validateRequest({
    body: z.object({
      name: z.string(),
      profilePicture: z.string().optional(),
    }),
  }),
  updateUserProfile
);
router.patch(
  "/change-password",
  authMiddleware,
  validateRequest({
    body: z.object({
      currentPassword: z.string(),
      newPassword: z.string(),
      confirmPassword: z.string(),
    }),
  }),
  changePassword
);

router.post(
  "/upload-profile-pic",
  authMiddleware,
  upload.single("image"),
  uploadUserProfilePic
);

router.post("/delete-account", authMiddleware, deleteAccount);

export default router;
