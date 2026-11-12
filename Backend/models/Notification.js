
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    recipientRole: {
      type: String,
      enum: ["student", "coordinator", "faculty", "admin"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "event_created",
        "event_closed",
        "event_registration",
        "student_registered",
        "user_registered",
        "event_approved",
        "event_rejected",
        "event_updated",
        "event_cancelled",
        "attendance_marked",
        "participation_confirmed",
        "certificate_generated",
      ],
      required: true,
    },

    relatedEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },

    // Optional for legacy notifications; new automated notifications use it
    // to make retries idempotent without changing existing documents.
    dedupeKey: {
      type: String,
      trim: true,
      default: undefined,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1,
});

notificationSchema.index(
  { recipient: 1, dedupeKey: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
