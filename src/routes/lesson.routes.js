import express from "express";

import {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
} from "../controllers/lesson.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/topics/:topicId/lessons",
  requireAuth,
  getLessons
);

router.post(
  "/topics/:topicId/lessons",
  requireAuth,
  createLesson
);

router.patch(
  "/topics/:topicId/lessons/:lessonId",
  requireAuth,
  updateLesson
);

router.delete(
  "/topics/:topicId/lessons/:lessonId",
  requireAuth,
  deleteLesson
);

export default router;