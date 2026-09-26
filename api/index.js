import { app } from "../src/app.js";
import { connectDatabase } from "../src/config/db.js";

let databasePromise;

async function handler(req, res) {
  try {
    if (!databasePromise) {
      databasePromise = connectDatabase();
    }

    await databasePromise;

    return app(req, res);
  } catch (error) {
    console.error("Database connection error:", error);

    return res.status(500).json({
      success: false,
      error: "Database connection failed.",
    });
  }
}

export default handler;