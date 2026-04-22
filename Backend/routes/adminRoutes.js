const express = require("express");
const protect = require("../Middleware/authMiddleware");
const allowRoles = require("../Middleware/roleMiddleware");

const Event = require("../models/Event");
const User = require("../models/User");

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  allowRoles("admin"),
  (req, res) => {
    res.json({
      message: "Welcome Admin !!",
      user: req.user,
    });
  }
);

router.get(
  "/stats",
  protect,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const totalEvents = await Event.countDocuments();

      const upcomingEvents = await Event.countDocuments({
        date: { $gte: today },
      });

      const totalStudents = await User.countDocuments({
        role: "student",
      });

      const registration = await Event.aggregate([
        {
          $project: {
            count: { $size: "$registeredStudent" },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$count" },
          },
        },
      ]);

      res.status(200).json({
        success: true,
        totalEvents,
        upcomingEvents,
        totalStudents,
        totalRegistrations: registration[0]?.total || 0,
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Stats fetch failed",
      });
    }
  }
);

module.exports = router;
