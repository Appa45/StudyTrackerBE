import mongoose from 'mongoose';

const preferencesSchema = new mongoose.Schema(
  {
    // Daily study goal in minutes
    // Example: 60 = 60 minutes
    dailyGoal: {
      type: Number,
      min: 15,
      max: 1440,
      default: 60
    },

    preferredDifficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate'
    }
  },
  { _id: false }
);

const notificationsSchema = new mongoose.Schema(
  {
    emailUpdates: {
      type: Boolean,
      default: true
    },

    studyReminders: {
      type: Boolean,
      default: true
    },

    weeklySummary: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    // Basic profile information
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true
    },

    phone: {
      type: String,
      trim: true,
      default: ''
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },

    preferredStudyTime: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening', 'Night'],
      default: 'Morning'
    },

    // Authentication
    passwordHash: {
      type: String,
      required: true,
      select: false
    },

    // User role
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    },

    // Learning preferences
    preferences: {
      type: preferencesSchema,
      default: () => ({})
    },

    // Notification preferences
    notifications: {
      type: notificationsSchema,
      default: () => ({})
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model('User', userSchema);