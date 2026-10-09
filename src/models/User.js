// src/models/User.js

import mongoose from "mongoose";

const preferencesSchema = new mongoose.Schema(
  {
    dailyGoal: {
      type: Number,
      min: 15,
      max: 1440,
      default: 60,
    },
    preferredDifficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
    },
  },
  { _id: false }
);

const notificationsSchema = new mongoose.Schema(
  {
    emailUpdates: {
      type: Boolean,
      default: true,
    },
    studyReminders: {
      type: Boolean,
      default: true,
    },
    weeklySummary: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    preferredStudyTime: {
      type: String,
      enum: ["Morning", "Afternoon", "Evening", "Night"],
      default: "Morning",
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    googleId: {
  type: String,
  unique: true,
  sparse: true,
  default: undefined,
},

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },

    notifications: {
      type: notificationsSchema,
      default: () => ({}),
    },

    // Password reset
    passwordResetToken: {
      type: String,
      default: null,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);