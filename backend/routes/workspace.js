import express from "express";
import { validateRequest } from "zod-express-middleware";
import { inviteMemberSchema, workspaceSchema } from "../libs/validateSchema.js";
import { authMiddleware } from "../middleware/auth-middleware.js";
import {
  acceptGeneralInvite,
  acceptInviteByToken,
  createWorkspace,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getWorkspaces,
  getWorkspaceStats,
  inviteMemberToWorkspace,
} from "../controllers/workspaceController.js";
import z from "zod";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  validateRequest({
    body: workspaceSchema,
  }),
  createWorkspace
);

router.post(
  "/accept-invite-token",
  validateRequest({
    body: z.object({ token: z.string() }),
  }),
  acceptInviteByToken
);

router.get("/", authMiddleware, getWorkspaces);
router.get("/:workspaceId", authMiddleware, getWorkspaceDetails);
router.post(
  "/:workspaceId/invite-member",
  authMiddleware,
  validateRequest({
    params: z.object({
      workspaceId: z.string(),
    }),
    body: inviteMemberSchema,
  }),
  inviteMemberToWorkspace
);

router.post(
  "/:workspaceId/accept-general-invite",
  authMiddleware,
  validateRequest({
    params: z.object({
      workspaceId: z.string(),
    }),
  }),
  acceptGeneralInvite
);

router.get("/:workspaceId/projects", authMiddleware, getWorkspaceProjects);
router.get("/:workspaceId/stats", authMiddleware, getWorkspaceStats);

export default router;
