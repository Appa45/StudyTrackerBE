import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema(
  {
    // Ownership is stored on every topic so authorization can be enforced directly in MongoDB queries.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    subject: { type: String, required: true, trim: true, maxlength: 60, index: true },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: true,
      index: true
    },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    targetDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed'],
      default: 'Not Started',
      index: true
    }
  },
  { timestamps: true }
);

topicSchema.index({ userId: 1, createdAt: -1 });
topicSchema.index({ userId: 1, status: 1 });
topicSchema.index({ userId: 1, subject: 1 });

export const Topic = mongoose.model('Topic', topicSchema);
