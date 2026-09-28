import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  console.log("MongoDB URI configured:", Boolean(env.mongoUri));
  console.log(
    "MongoDB URI prefix:",
    env.mongoUri.substring(0, 14)
  );

  await mongoose.connect(env.mongoUri);

  console.log("MongoDB connected");
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}