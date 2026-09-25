import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  // Fail fast when MongoDB is unavailable rather than starting a half-working API.
  await mongoose.connect(env.mongoUri);
  console.log('MongoDB connected');
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
