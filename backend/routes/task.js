import express from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth-middleware.js";
import { validateRequest } from "zod-express-middleware";
import { taskSchema } from "../libs/validateSchema.js";
import {
  addComment,
  addSubtask,
  archiveTask,
  createTask,
  deleteTask,
  getActivityByResourceId,
  getArchivedTasks,
  getCommentsByTaskId,
  getMyTasks,
  getTaskById,
  getWatchTaskActivities,
  updateSubTask,
  updateTaskAssignees,
  updateTaskDescription,
  updateTaskPriority,
  updateTaskStatus,
  updateTaskTitle,
  uploadAttachment,
  watchTask,
} from "../controllers/taskController.js";
import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = express.Router();

router.post(
  "/:projectId/create-task",
  authMiddleware,
  validateRequest({
    params: z.object({
      projectId: z.string(),
    }),
    body: taskSchema,
  }),
  createTask
);

router.get("/my-tasks", authMiddleware, getMyTasks);

router.get("/my-activities", authMiddleware, getWatchTaskActivities);

router.get("/archived-tasks", authMiddleware, getArchivedTasks);

router.get(
  "/:taskId",
  authMiddleware,
  validateRequest({
    params: z.object({
      taskId: z.string(),
    }),
  }),
  getTaskById
);

router.post(
  "/:taskId/upload-attachment",
  authMiddleware,
  upload.single("attachment"),
  validateRequest({
    params: z.object({ taskId: z.string() }),
  }),
  uploadAttachment
);

router.delete(
  "/:taskId/delete-task",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
  }),
  deleteTask
);

router.patch(
  "/:taskId/title",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ title: z.string() }),
  }),
  updateTaskTitle
);

router.patch(
  "/:taskId/description",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ description: z.string() }),
  }),
  updateTaskDescription
);

router.patch(
  "/:taskId/status",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ status: z.string() }),
  }),
  updateTaskStatus
);

router.patch(
  "/:taskId/assignees",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({
      assigneeIds: z.array(z.string()),
    }),
  }),
  updateTaskAssignees
);

router.patch(
  "/:taskId/priority",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ priority: z.string() }),
  }),
  updateTaskPriority
);

router.post(
  "/:taskId/add-subtask",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ title: z.string() }),
  }),
  addSubtask
);

router.patch(
  "/:taskId/update-subtask/:subTaskId",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string(), subTaskId: z.string() }),
    body: z.object({ completed: z.boolean() }),
  }),
  updateSubTask
);

router.get(
  "/:resourceId/activity",
  authMiddleware,
  validateRequest({
    params: z.object({ resourceId: z.string() }),
  }),
  getActivityByResourceId
);

router.get(
  "/:taskId/comments",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
  }),
  getCommentsByTaskId
);

router.post(
  "/:taskId/add-comment",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ text: z.string() }),
  }),
  addComment
);

router.post(
  "/:taskId/watch",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
  }),
  watchTask
);

router.post(
  "/:taskId/archived",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
  }),
  archiveTask
);

export default router;
