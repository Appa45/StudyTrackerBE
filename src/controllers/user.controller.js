import { User } from "../models/User.js";

/**
 * Get logged-in user's profile
 */
export async function getProfile(req, res) {
  try {
    const userId =
      req.user?.id ||
      req.user?.userId ||
      req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication information is missing.",
      });
    }

    const user = await User.findById(userId).select(
      "-passwordHash"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load profile.",
    });
  }
}

/**
 * Update logged-in user's profile
 */
export async function updateProfile(req, res) {
  try {
    const userId =
      req.user?.id ||
      req.user?.userId ||
      req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication information is missing.",
      });
    }

    const {
      name,
      phone,
      bio,
      preferredDifficulty,
      dailyStudyGoal,
      preferredStudyTime,
      preferences,
      notifications,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    /*
     * -----------------------------------------
     * Personal information
     * -----------------------------------------
     */

    if (name !== undefined) {
      const trimmedName = String(name).trim();

      if (
        trimmedName.length < 2 ||
        trimmedName.length > 80
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Name must be between 2 and 80 characters.",
        });
      }

      user.name = trimmedName;
    }

    if (phone !== undefined) {
      user.phone = String(phone).trim();
    }

    if (bio !== undefined) {
      const trimmedBio = String(bio).trim();

      if (trimmedBio.length > 500) {
        return res.status(400).json({
          success: false,
          message:
            "Bio cannot exceed 500 characters.",
        });
      }

      user.bio = trimmedBio;
    }

    if (preferredStudyTime !== undefined) {
      const allowedStudyTimes = [
        "Morning",
        "Afternoon",
        "Evening",
        "Night",
      ];

      if (
        !allowedStudyTimes.includes(
          preferredStudyTime
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid preferred study time.",
        });
      }

      user.preferredStudyTime =
        preferredStudyTime;
    }

    /*
     * -----------------------------------------
     * Learning preferences
     * -----------------------------------------
     */

    // Support the frontend format:
    // dailyStudyGoal: 60
    if (dailyStudyGoal !== undefined) {
      const dailyGoal = Number(dailyStudyGoal);

      if (
        !Number.isFinite(dailyGoal) ||
        dailyGoal < 15 ||
        dailyGoal > 1440
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Daily study goal must be between 15 and 1440 minutes.",
        });
      }

      user.preferences.dailyGoal =
        dailyGoal;
    }

    if (preferredDifficulty !== undefined) {
      const allowedDifficulties = [
        "Beginner",
        "Intermediate",
        "Advanced",
      ];

      if (
        !allowedDifficulties.includes(
          preferredDifficulty
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid preferred difficulty.",
        });
      }

      user.preferences.preferredDifficulty =
        preferredDifficulty;
    }

    /*
     * -----------------------------------------
     * Backward-compatible preferences object
     * -----------------------------------------
     *
     * Supports requests like:
     *
     * {
     *   "preferences": {
     *     "dailyGoal": 60,
     *     "preferredDifficulty": "Beginner"
     *   }
     * }
     */

    if (preferences !== undefined) {
      if (
        preferences.dailyGoal !== undefined
      ) {
        const dailyGoal = Number(
          preferences.dailyGoal
        );

        if (
          !Number.isFinite(dailyGoal) ||
          dailyGoal < 15 ||
          dailyGoal > 1440
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Daily goal must be between 15 and 1440 minutes.",
          });
        }

        user.preferences.dailyGoal =
          dailyGoal;
      }

      if (
        preferences.preferredDifficulty !==
        undefined
      ) {
        const allowedDifficulties = [
          "Beginner",
          "Intermediate",
          "Advanced",
        ];

        if (
          !allowedDifficulties.includes(
            preferences.preferredDifficulty
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid preferred difficulty.",
          });
        }

        user.preferences.preferredDifficulty =
          preferences.preferredDifficulty;
      }
    }

    /*
     * -----------------------------------------
     * Notification preferences
     * -----------------------------------------
     */

    if (notifications !== undefined) {
      if (
        notifications.emailUpdates !== undefined
      ) {
        user.notifications.emailUpdates =
          Boolean(
            notifications.emailUpdates
          );
      }

      if (
        notifications.studyReminders !== undefined
      ) {
        user.notifications.studyReminders =
          Boolean(
            notifications.studyReminders
          );
      }

      if (
        notifications.weeklySummary !== undefined
      ) {
        user.notifications.weeklySummary =
          Boolean(
            notifications.weeklySummary
          );
      }
    }

    /*
     * -----------------------------------------
     * Save user
     * -----------------------------------------
     */

    await user.save();

    const updatedUser =
      await User.findById(userId).select(
        "-passwordHash"
      );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to update profile.",
    });
  }
}