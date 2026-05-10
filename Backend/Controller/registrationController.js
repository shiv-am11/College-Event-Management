const Registration = require("../models/Registration");

exports.registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const studentId = req.user._id;

    const exists = await Registration.findOne({ studentId, eventId });

    if (exists) {
      return res.status(400).json({ message: "Already applied" });
    }

    const registration = await Registration.create({
      studentId,
      eventId
    });

    res.json({
      message: "Request sent",
      registration
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};