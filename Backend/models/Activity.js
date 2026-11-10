const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "event_registered",
        "event_attended",
        "event_participated",
        "certificate_received",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },
    certificate: {
      title: {
        type: String,
        default: "",
      },
      certificateUrl: {
        type: String,
        default: "",
      },
      issueDate: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true }
);
activitySchema.index(
  { student: 1, type: 1, event: 1 },
  {
    unique: true,
    partialFilterExpression: { event: { $exists: true, $ne: null } },
  }
);

activitySchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model("Activity", activitySchema);
