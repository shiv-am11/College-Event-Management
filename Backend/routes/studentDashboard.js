const express = require("express");
const router = express.Router();

const Event = require("../models/Event");
const protect = require("../Middleware/authMiddleware");

router.get("/dashboard-stats", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const allEvents = await Event.find();

   const registeredEvents = allEvents.filter((event) =>
   event.registeredStudent.some(
    (id) => id.toString() === userId
  )
);

    const today = new Date();

    const upcomingEvents = registeredEvents.filter(
      (e) => new Date(e.date) >= today
    );

    const certificates = 8;
    const score = registeredEvents.length * 10;

    res.json({
      registeredCount: registeredEvents.length,
      upcomingCount: upcomingEvents.length,
      certificates,
      score,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;