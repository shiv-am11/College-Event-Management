const Notification = require("../models/Notification");
const User = require("../models/User");
const mongoose = require("mongoose");

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

  if (!mongoose.Types.ObjectId.isValid(recipient)) {
    throw new Error("Invalid notification recipient");
  }

  const recipientExists = await User.exists({
    _id: recipient,
    role: recipientRole,
  });

  if (!recipientExists) {
    throw new Error("Notification recipient not found or role mismatch");
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
