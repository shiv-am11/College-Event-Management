const express = require("express");
const router = express.Router();

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require("../Controller/notificationController");

const { protect } = require("../Middleware/authMiddleware");

router.get("/", protect, getNotifications);
router.patch("/read-all", protect, markAllAsRead);
router.patch("/:id/read", protect, markAsRead);

module.exports = router;