import mongoose from "mongoose";
import { Lesson } from "../models/Lesson.js";
import { Topic } from "../models/Topic.js";

function getUserId(req) {
  return (
    req.user?.id ||
    req.user?.userId ||
    req.user?._id
  );
}

function validateTopicId(topicId) {
  return mongoose.isValidObjectId(topicId);
}

/**
 * Recalculate topic progress
 */
async function recalculateTopicProgress(
  topicId,
  userId
) {
  const totalLessons =
    await Lesson.countDocuments({
      topicId,
      userId,
    });

  const completedLessons =
    await Lesson.countDocuments({
      topicId,
      userId,
      completed: true,
    });

  const progress =
    totalLessons > 0
      ? Math.round(
          (completedLessons / totalLessons) * 100
        )
      : 0;

  let status = "Not Started";

  if (progress === 100) {
    status = "Completed";
  } else if (progress > 0) {
    status = "In Progress";
  }

  await Topic.findOneAndUpdate(
    {
      _id: topicId,
      userId,
    },
    {
      $set: {
        progress,
        status,
        completedLessons,
        totalLessons,
      },
    }
  );

  return {
    progress,
    status,
    completedLessons,
    totalLessons,
  };
}

/**
 * GET /api/topics/:topicId/lessons
 */
export async function getLessons(req, res) {
  try {
    const userId = getUserId(req);
    const { topicId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!validateTopicId(topicId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid topic id.",
      });
    }

    const topic = await Topic.findOne({
      _id: topicId,
      userId,
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found.",
      });
    }

    const lessons = await Lesson.find({
      topicId,
      userId,
    }).sort({
      order: 1,
      createdAt: 1,
    });

    return res.status(200).json({
      success: true,
      data: lessons,
    });
  } catch (error) {
    console.error(
      "Get lessons error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to load lessons.",
    });
  }
}

/**
 * POST /api/topics/:topicId/lessons
 */
export async function createLesson(req, res) {
  try {
    const userId = getUserId(req);
    const { topicId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!validateTopicId(topicId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid topic id.",
      });
    }

    const topic = await Topic.findOne({
      _id: topicId,
      userId,
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found.",
      });
    }

    const {
      title,
      description,
      content,
      resourceType,
      resourceUrl,
      order,
    } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: "Lesson title is required.",
      });
    }

    const lessonCount =
      await Lesson.countDocuments({
        topicId,
        userId,
      });

    const lesson = await Lesson.create({
      topicId,
      userId,
      title: String(title).trim(),
      description:
        description
          ? String(description).trim()
          : "",
      content:
        content
          ? String(content).trim()
          : "",
      resourceType:
        resourceType || "none",
      resourceUrl:
        resourceUrl
          ? String(resourceUrl).trim()
          : "",
      order:
        order !== undefined
          ? Number(order)
          : lessonCount,
    });

    const progress =
      await recalculateTopicProgress(
        topicId,
        userId
      );

    return res.status(201).json({
      success: true,
      message: "Lesson created successfully.",
      data: lesson,
      progress,
    });
  } catch (error) {
    console.error(
      "Create lesson error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to create lesson.",
    });
  }
}

/**
 * PATCH /api/topics/:topicId/lessons/:lessonId
 */
export async function updateLesson(req, res) {
  try {
    const userId = getUserId(req);
    const {
      topicId,
      lessonId,
    } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (
      !validateTopicId(topicId) ||
      !validateTopicId(lessonId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid topic or lesson id.",
      });
    }

    const lesson = await Lesson.findOne({
      _id: lessonId,
      topicId,
      userId,
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found.",
      });
    }

    const {
      title,
      description,
      content,
      resourceType,
      resourceUrl,
      completed,
      order,
    } = req.body;

    if (title !== undefined) {
      const trimmedTitle =
        String(title).trim();

      if (
        trimmedTitle.length < 2 ||
        trimmedTitle.length > 150
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Lesson title must be between 2 and 150 characters.",
        });
      }

      lesson.title = trimmedTitle;
    }

    if (description !== undefined) {
      lesson.description =
        String(description).trim();
    }

    if (content !== undefined) {
      lesson.content =
        String(content).trim();
    }

    if (resourceType !== undefined) {
      lesson.resourceType =
        resourceType;
    }

    if (resourceUrl !== undefined) {
      lesson.resourceUrl =
        String(resourceUrl).trim();
    }

    if (order !== undefined) {
      lesson.order = Number(order);
    }

    if (completed !== undefined) {
      lesson.completed =
        Boolean(completed);

      lesson.completedAt =
        lesson.completed
          ? new Date()
          : null;
    }

    await lesson.save();

    const progress =
      await recalculateTopicProgress(
        topicId,
        userId
      );

    return res.status(200).json({
      success: true,
      message: "Lesson updated successfully.",
      data: lesson,
      progress,
    });
  } catch (error) {
    console.error(
      "Update lesson error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to update lesson.",
    });
  }
}

/**
 * DELETE /api/topics/:topicId/lessons/:lessonId
 */
export async function deleteLesson(req, res) {
  try {
    const userId = getUserId(req);
    const {
      topicId,
      lessonId,
    } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (
      !validateTopicId(topicId) ||
      !validateTopicId(lessonId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid topic or lesson id.",
      });
    }

    const lesson =
      await Lesson.findOneAndDelete({
        _id: lessonId,
        topicId,
        userId,
      });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found.",
      });
    }

    const progress =
      await recalculateTopicProgress(
        topicId,
        userId
      );

    return res.status(200).json({
      success: true,
      message: "Lesson deleted successfully.",
      progress,
    });
  } catch (error) {
    console.error(
      "Delete lesson error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to delete lesson.",
    });
  }
}