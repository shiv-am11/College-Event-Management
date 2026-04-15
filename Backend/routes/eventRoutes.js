const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// GET all approved events (public)
router.get("/", async (req, res) => {
  try {
    const events = await Event.find({ status: "approved" });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
