
const express = require("express");
const mongoose = require("mongoose");
const Event = require("../models/Event");
const protect = require("../Middleware/authMiddleware");

const router = express.Router();

router.get("/events", protect, async (req, res) => {
  try {
    const studentId = req.user._id;

    const events = await Event.find({
      status: "approved",
    }).lean();

    const updatedEvents = events.map((event) => {
      const registeredStudents = event.registeredStudent || [];

      const isRegistered = registeredStudents.some(
        (id) => id.toString() === studentId.toString()
      );

      return {
        ...event,
        isRegistered,
        whatsappLink: event.whatsappLink || "",
      };
    });

    return res.status(200).json({
      events: updatedEvents,
    });
  } catch (err) {
    console.error("Fetch student events error:", err);
    return res.status(500).json({
      message: "Failed to fetch events",
    });
  }
});

router.post("/events/:id/register", protect, async (req, res) => {
  try {
    const studentId = req.user._id;
    const eventId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    const event = await Event.findOne({
      _id: eventId,
      status: "approved",
    });

    if (!event) {
      return res.status(404).json({
        message: "Approved event not found",
      });
    }
    const alreadyRegistered = (event.registeredStudent || []).some(
      (id) => id.toString() === studentId.toString()
    );

    if (alreadyRegistered) {
      return res.status(409).json({
        message: "Already registered",
        isRegistered: true,
      });
    }

    if (
      event.capacity != null &&
      event.attendees >= event.capacity
    ) {
      return res.status(400).json({
        message: "Event is full",
      });
    }

    event.registeredStudent.push(studentId);
    event.attendees = (event.attendees || 0) + 1;

    await event.save();

    return res.status(200).json({
      message: "Registered successfully",
      isRegistered: true,
      event,
    });
  } catch (err) {
    console.error("Event registration error:", err);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
});

router.get("/my-events", protect, async (req, res) => {
  try {
    const studentId = req.user._id;

    const events = await Event.find({
      registeredStudent: studentId,
    }).select(
      "title description date time venue category image whatsappLink"
    );

    return res.status(200).json(events);
  } catch (err) {
    console.error("Fetch my events error:", err);

    return res.status(500).json({
      message: "Failed to fetch registered events",
    });
  }
});

module.exports = router;
