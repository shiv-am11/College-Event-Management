const Activity = require("../models/Activity");

/**
 * Safely records an activity in MongoDB.
 * Checks for existing records to avoid duplicates.
 */
const recordActivity = async ({
  studentId,
  type,
  title,
  description,
  eventId = null,
  certificate = null,
}) => {
  try {
    if (!studentId || !type || !title || !description) {
      return null;
    }

    // Check if duplicate already exists
    const filter = {
      student: studentId,
      type,
    };
    if (eventId) {
      filter.event = eventId;
    }

    const existing = await Activity.findOne(filter);
    if (existing) {
      return existing;
    }

    const activity = new Activity({
      student: studentId,
      type,
      title,
      description,
      event: eventId,
      certificate: certificate || {},
    });

    await activity.save();
    return activity;
  } catch (err) {
    // If Mongo duplicate key error occurs, ignore gracefully
    if (err.code === 11000) {
      return null;
    }
    console.error("Error in recordActivity helper:", err.message);
    return null;
  }
};

module.exports = recordActivity;

