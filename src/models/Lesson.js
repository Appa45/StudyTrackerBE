import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    content: {
      type: String,
      trim: true,
      default: "",
    },

    resourceType: {
      type: String,
      enum: [
        "none",
        "image",
        "pdf",
        "external",
      ],
      default: "none",
    },

    resourceUrl: {
      type: String,
      trim: true,
      default: "",
    },

    completed: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

lessonSchema.index({
  topicId: 1,
  userId: 1,
  order: 1,
});

export const Lesson = mongoose.model(
  "Lesson",
  lessonSchema
);