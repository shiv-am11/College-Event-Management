const express = require("express");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const protect = require("../Middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const filter = { recipient: req.user._id };

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Notification.countDocuments({
        ...filter,
        isRead: false,
      }),
    ]);

    return res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return res.status(500).json({
      message: "Failed to fetch notifications",
    });
  }
});

router.patch("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    return res.json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all read error:", error);
    return res.status(500).json({
      message: "Failed to update notifications",
    });
  }
});

router.patch("/:id/read", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user._id,
      },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.json({ notification });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return res.status(500).json({
      message: "Failed to update notification",
    });
  }
});

module.exports = router;
