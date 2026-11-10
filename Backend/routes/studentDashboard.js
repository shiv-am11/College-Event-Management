const express = require("express");
const router = express.Router();

const Event = require("../models/Event");
const Activity = require("../models/Activity");
const protect = require("../Middleware/authMiddleware");
const recordActivity = require("../utils/activityLogger");

router.get("/dashboard-stats", protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const allEvents = await Event.find();

    const registeredEvents = allEvents.filter((event) =>
      (event.registeredStudent || []).some(
        (id) => id.toString() === userId.toString()
      )
    );

    const today = new Date();

    const upcomingEvents = registeredEvents.filter(
      (e) => new Date(e.date) >= today
    );

    const certCount = await Activity.countDocuments({
      student: userId,
      type: "certificate_received",
    });

    const certificates = certCount > 0 ? certCount : 0;
    const score = registeredEvents.length * 10;

    res.json({
      registeredCount: registeredEvents.length,
      upcomingCount: upcomingEvents.length,
      certificates,
      score,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/student/activities
router.get("/activities", protect, async (req, res) => {
  try {
    const studentId = req.user._id || req.user.id;

    // Load any existing activity keys for this student to avoid redundant sync checks
    const existingActivities = await Activity.find({
      student: studentId,
    })
      .select("event type")
      .lean();

    const existingKeys = new Set(
      existingActivities
        .filter((a) => a.event)
        .map((a) => `${a.type}_${a.event.toString()}`)
    );

    // Sync any existing registered/attended events the student actually has in MongoDB
    const registeredEvents = await Event.find({
      registeredStudent: studentId,
    }).select(
      "title registeredStudent attendedStudents participatedStudents certificatesIssued createdAt"
    );

    for (const ev of registeredEvents) {
      const evId = ev._id.toString();

      // 1. Event Registered
      if (!existingKeys.has(`event_registered_${evId}`)) {
        await recordActivity({
          studentId,
          type: "event_registered",
          title: "Event Registered",
          description: `Registered for "${ev.title}"`,
          eventId: ev._id,
        });
        existingKeys.add(`event_registered_${evId}`);
      }

      // 2. Event Attended
      const attended = (ev.attendedStudents || []).some(
        (id) => id.toString() === studentId.toString()
      );
      if (attended && !existingKeys.has(`event_attended_${evId}`)) {
        await recordActivity({
          studentId,
          type: "event_attended",
          title: "Event Attended",
          description: `Attendance confirmed for "${ev.title}"`,
          eventId: ev._id,
        });
        existingKeys.add(`event_attended_${evId}`);
      }

      // 3. Event Participated
      const participated = (ev.participatedStudents || []).some(
        (id) => id.toString() === studentId.toString()
      );
      if (participated && !existingKeys.has(`event_participated_${evId}`)) {
        await recordActivity({
          studentId,
          type: "event_participated",
          title: "Event Participated",
          description: `Participation confirmed in "${ev.title}"`,
          eventId: ev._id,
        });
        existingKeys.add(`event_participated_${evId}`);
      }

      // 4. Certificate Received
      const cert = (ev.certificatesIssued || []).find(
        (c) => c.student && c.student.toString() === studentId.toString()
      );
      if (cert && !existingKeys.has(`certificate_received_${evId}`)) {
        await recordActivity({
          studentId,
          type: "certificate_received",
          title: "Certificate Received",
          description: `Received "${
            cert.title || `Certificate of Participation - ${ev.title}`
          }"`,
          eventId: ev._id,
          certificate: {
            title:
              cert.title ||
              `Certificate of Participation - ${ev.title}`,
            certificateUrl: cert.certificateUrl || "",
            issueDate: cert.issuedAt || new Date(),
          },
        });
        existingKeys.add(`certificate_received_${evId}`);
      }
    }

    // Query logged-in student's activities, newest first
    const limit = parseInt(req.query.limit, 10);
    let query = Activity.find({ student: studentId })
      .sort({ createdAt: -1 })
      .populate("event", "title category venue date image time")
      .populate("student", "name email course college year");

    if (!isNaN(limit) && limit > 0) {
      query = query.limit(limit);
    }

    const activities = await query.lean();

    return res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (err) {
    console.error("Fetch activities error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch activities",
    });
  }
});

module.exports = router;
