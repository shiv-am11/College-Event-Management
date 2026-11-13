const express = require("express");
const protect = require("../Middleware/authMiddleware");
const allowRoles = require("../Middleware/roleMiddleware");
const {createUser} = require("../Controller/adminCreate.controller")
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

router.get(
  "/analytics",
  protect,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const [eventAnalytics, studentAnalytics] = await Promise.all([
        Event.aggregate([
          {
            $facet: {
              summary: [
                {
                  $group: {
                    _id: null,
                    totalEvents: { $sum: 1 },
                    totalRegistrations: {
                      $sum: {
                        $cond: [
                          { $isArray: "$registeredStudent" },
                          { $size: "$registeredStudent" },
                          0,
                        ],
                      },
                    },
                  },
                },
              ],
              statuses: [
                { $group: { _id: "$status", count: { $sum: 1 } } },
                { $sort: { count: -1, _id: 1 } },
              ],
              categories: [
                {
                  $project: {
                    category: {
                      $let: {
                        vars: {
                          value: {
                            $trim: { input: { $ifNull: ["$category", ""] } },
                          },
                        },
                        in: {
                          $cond: [
                            { $eq: ["$$value", ""] },
                            "Uncategorized",
                            "$$value",
                          ],
                        },
                      },
                    },
                  },
                },
                { $group: { _id: "$category", count: { $sum: 1 } } },
                { $sort: { count: -1, _id: 1 } },
              ],
            },
          },
        ]),
        User.aggregate([
          { $match: { role: "student" } },
          {
            $project: {
              course: {
                $let: {
                  vars: {
                    value: {
                      $trim: { input: { $ifNull: ["$course", ""] } },
                    },
                  },
                  in: {
                    $cond: [
                      { $eq: ["$$value", ""] },
                      "Unspecified",
                      "$$value",
                    ],
                  },
                },
              },
            },
          },
          { $group: { _id: "$course", count: { $sum: 1 } } },
          { $sort: { count: -1, _id: 1 } },
        ]),
      ]);

      const eventData = eventAnalytics[0] || {};
      const summary = eventData.summary?.[0] || {};
      const statusCounts = (eventData.statuses || []).reduce((counts, item) => {
        const status = item._id || "unknown";
        counts[status] = item.count;
        return counts;
      }, {});

      res.json({
        success: true,
        stats: {
          totalEvents: summary.totalEvents || 0,
          totalStudents: studentAnalytics.reduce((total, item) => total + item.count, 0),
          totalRegistrations: summary.totalRegistrations || 0,
          approvedEvents: statusCounts.approved || 0,
          pendingEvents: statusCounts.pending || 0,
          rejectedEvents: statusCounts.rejected || 0,
        },
        eventsByCategory: (eventData.categories || []).map((item) => ({
          category: item._id,
          count: item.count,
        })),
        studentsByCourse: studentAnalytics.map((item) => ({
          course: item._id,
          count: item.count,
        })),
      });
    } catch (error) {
      console.error("Admin analytics error:", error);
      res.status(500).json({
        success: false,
        message: "Analytics fetch failed",
      });
    }
  }
);
router.post("/users",protect,allowRoles("admin"),createUser )

module.exports = router;
