import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

async function startServer() {
  try {
    await connectDatabase();

    app.listen(env.port, () => {
      console.log(
        `StudyTrack API running on http://localhost:${env.port}`
      );
    });
  } catch (error) {
    console.error("Failed to start StudyTrack API:", error);
    process.exit(1);
  }
}

startServer();