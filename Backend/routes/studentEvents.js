const express = require("express");
const Event = require("../models/Event");
const protect = require("../Middleware/authMiddleware");

const router = express.Router();

router.get("/events", async (req, res) => {
  try {
    const events = await Event.find({ status: "approved" });
    res.json({ events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/events/:id/register", protect, async (req, res) => {
  try {
    const studentId = req.user._id; 
    const eventId = req.params.id;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
     if(event.registeredStudent.includes(studentId)){
      return res.status(400).json({message : "Already registered ✅"})
     }

    if (event.attendees >= event.capacity) {
      return res.status(400).json({ message: "Event is full" });
    }
    event.registeredStudent.push(studentId);
    event.attendees +=1;

    await event.save();
    
    res.json({
      message: "Registered successfully",
      event
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/my-events", protect, async (req, res) => {
  try {
    const studentId = req.user._id;

    const events = await Event.find({
      registeredStudent: studentId
    }).select("title date venue category");

    res.json(events);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
