import mongoose from 'mongoose';
import { Topic } from '../models/Topic.js';

function ensureOwnedTopicFilter(userId, topicId) {
  if (!mongoose.isValidObjectId(topicId)) {
    const error = new Error('Invalid topic id.');
    error.statusCode = 400;
    throw error;
  }
  return { _id: topicId, userId };
}

export async function createTopic(userId, input) {
  return Topic.create({ ...input, userId });
}

export async function listTopics(userId, filters) {
  const { search, subject, difficulty, status, page, limit } = filters;
  const query = { userId };

  if (search) {
    // Escape regex characters so the search term cannot become an arbitrary regex.
    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { title: { $regex: safeSearch, $options: 'i' } },
      { subject: { $regex: safeSearch, $options: 'i' } },
      { description: { $regex: safeSearch, $options: 'i' } }
    ];
  }

  if (subject) query.subject = subject;
  if (difficulty) query.difficulty = difficulty;
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Topic.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Topic.countDocuments(query)
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getTopic(userId, topicId) {
  console.log("========== GET TOPIC DEBUG ==========");
  console.log("userId:", userId);
  console.log("topicId:", topicId);
  console.log("valid topicId:", mongoose.isValidObjectId(topicId));

  const filter = ensureOwnedTopicFilter(userId, topicId);

  console.log("Mongo filter:", filter);

  const topic = await Topic.findOne(filter);

  console.log("Found topic:", topic);

  if (!topic) {
    const error = new Error('Topic not found.');
    error.statusCode = 404;
    throw error;
  }

  return topic;
}

export async function updateTopic(userId, topicId, input) {
  const filter = ensureOwnedTopicFilter(userId, topicId);

  // Get current topic first
  const existingTopic = await Topic.findOne(filter);

  if (!existingTopic) {
    const error = new Error('Topic not found.');
    error.statusCode = 404;
    throw error;
  }

  // Determine final progress
  const progress =
    input.progress !== undefined
      ? Number(input.progress)
      : existingTopic.progress;

  // Automatically determine status from progress
  let status = input.status ?? existingTopic.status;

  if (progress >= 100) {
    status = 'Completed';
  } else if (progress <= 0) {
    status = 'Not Started';
  } else {
    status = 'In Progress';
  }

  const topic = await Topic.findOneAndUpdate(
    filter,
    {
      $set: {
        ...input,
        progress,
        status,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  return topic;
}

export async function deleteTopic(userId, topicId) {
  const topic = await Topic.findOneAndDelete(ensureOwnedTopicFilter(userId, topicId));
  if (!topic) {
    const error = new Error('Topic not found.');
    error.statusCode = 404;
    throw error;
  }
}
