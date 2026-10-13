
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";

import authRoutes from "./routes/auth.routes.js";
import topicRoutes from "./routes/topic.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import userRoutes from "./routes/user.routes.js";
import lessonRoutes from "./routes/lesson.routes.js";
import aiRoutes from "./routes/ai.routes.js";

import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";

export const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

// Normalize origins to avoid mismatches caused by trailing slashes.
function normalizeOrigin(value) {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

const allowedOrigins = new Set(
  [
    env.clientUrl,
    process.env.CLIENT_URL,
    "https://studytrack-frontend-phi.vercel.app",
    "http://localhost:3000",
  ]
    .map(normalizeOrigin)
    .filter(Boolean)
);

const corsOptions = {
  origin(origin, callback) {
    // Requests without an Origin header include server-to-server requests.
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    console.error("CORS rejected origin:", origin);

    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  maxAge: 86400,
};

app.use(helmet());
app.use(cors(corsOptions));

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(cookieParser());

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "studytrack-backend",
    status: "ok",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", lessonRoutes);

// Error handlers must come after all routes.
app.use(notFoundHandler);
app.use(errorHandler);
