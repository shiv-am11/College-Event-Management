const Notification = require("../models/Notification");

/**
 * Creates one automated notification per recipient/dedupe key.
 * Existing notifications without a dedupeKey are left untouched.
 */
const createNotification = async ({
  recipient,
  recipientRole,
  title,
  message,
  type,
  relatedEvent = null,
  dedupeKey,
}) => {
  if (!recipient || !recipientRole || !title || !message || !type || !dedupeKey) {
    throw new Error("Missing required notification fields");
  }

  const payload = {
    recipient,
    recipientRole,
    title,
    message,
    type,
    relatedEvent,
    dedupeKey,
  };

  try {
    return await Notification.findOneAndUpdate(
      { recipient, dedupeKey },
      { $setOnInsert: payload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    // A concurrent retry may win the unique index race. Return that record.
    if (error?.code === 11000) {
      return Notification.findOne({ recipient, dedupeKey });
    }
    throw error;
  }
};

module.exports = createNotification;
