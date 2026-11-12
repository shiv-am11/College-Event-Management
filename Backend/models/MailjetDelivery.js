const mongoose = require("mongoose");

const mailjetDeliverySchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  status: { type: String, enum: ["pending", "sending", "accepted", "failed"], default: "pending" },
  attempts: { type: Number, default: 0 },
  providerMessageId: { type: String, default: "" },
  lastError: { type: String, default: "" },
  sendingAt: Date,
  completedAt: Date,
}, { timestamps: true });

mailjetDeliverySchema.index({ event: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("MailjetDelivery", mailjetDeliverySchema);
