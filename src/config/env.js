import "dotenv/config";

function required(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT || 5000),

  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",

  mongoUri: required("MONGODB_URI"),

  jwtSecret: required("JWT_SECRET"),

  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  geminiApiKey: process.env.GEMINI_API_KEY || "",

  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",

  // SMTP
  smtpHost: required("SMTP_HOST"),
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: required("SMTP_USER"),
  smtpPassword: required("SMTP_PASSWORD"),
};