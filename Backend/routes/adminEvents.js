const express = require("express");
const protect = require("../Middleware/authMiddleware");
const allowRoles = require("../Middleware/roleMiddleware");
const Event = require("../models/Event");
const uploadFile = require("../config/imageKit");

const router = express.Router();
const upload = require("../Middleware/upload");

router.post(
  "/events",
  protect,
  allowRoles("admin"),
  upload.single("image"),   
  async (req, res) => {
    try {
      console.log("BODY:", req.body);
      let imageUrl = "";

      const {
        title,
        description,
        date,
        time,
        venue,
        category,
        capacity,
      } = req.body || {};

      if (!title || !date || !time || !venue || !capacity) {
        return res.status(400).json({
          success: false,
          message: "Required fields missing",
        });
      }
      if(req.file){
        imageUrl = await uploadFile(req.file);
      }
      const newEvent = new Event({
        title,
        description,
        date,
        time,
        venue,
        category,
        capacity,
        image: imageUrl,
        status: "approved",
      });

      await newEvent.save();

      res.status(201).json({
        success: true,
        message: "Event created successfully",
        event: newEvent,
      });
    } catch (err) {
      console.log("CREATE EVENT ERROR:", err);
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

router.get("/events", protect, allowRoles("admin"), async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json({ success: true, events });
  } catch (err) {
    console.log("GET EVENTS ERROR ", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/events/:id", protect, allowRoles("admin"), async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (err) {
    console.log("UPDATE EVENT ERROR ", err);
    res.status(400).json({ success: false, message: err.message });
  }
});


router.delete("/events/:id", protect, allowRoles("admin"), async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Event deleted successfully" });
  } catch (err) {
    console.log("DELETE EVENT ERROR ", err);
    res.status(400).json({ success: false, message: err.message });
  }
});
router.get(
  "/event/:id/registrations",
  protect,
  allowRoles("admin"),
  async (req, res) => {
    try {
      console.log("EVENT ID:", req.params.id);

      const event = await Event.findById(req.params.id).populate({
        path: "registeredStudent",
        select: "name email phone college"
      });

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      res.json({
        eventId: event._id,
        total: event.registeredStudent.length,
        students: event.registeredStudent
      });

    } catch (err) {
      console.error("BACKEND ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  }
);
module.exports = router;
