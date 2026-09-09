const User = require("../models/User");
const Event = require("../models/Event");
const uploadFile = require("../config/imageKit");


const departmentStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      course: req.user.course
    }).select("name email course year");

    res.json(students);

  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      message: "Something went wrong!"
    });
  }
};
const getStudentFromEvents = async (req, res) => {
  try {
    const fetchStudent = await Event.findOne({
      _id: req.params.id,
      course: req.user.course
    }).populate(
      "registeredStudent",
      "name email course year"
    );

    if (!fetchStudent) {
      return res.status(404).json({
        message: "Event not found or you don't have access to this event"
      });
    }

    const courseStudents = fetchStudent.registeredStudent.filter(
      (student) => student.course === req.user.course
    );

    res.json(courseStudents);

  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      message: "Something went wrong!"
    });
  }
};
const coordinatorEvents = async (req, res) => {
  try {
    const courseEvents = await Event.find({
      course: req.user.course
    }).sort({ createdAt: -1 });

    if (courseEvents.length === 0) {
      return res.status(404).json({
        message: "No event found"
      });
    }

    res.json(courseEvents);

  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      message: "Something went wrong!"
    });
  }
};
const getDashboardStats = async (req, res) => {
  try {
    const course = req.user.course;

    const totalEvents = await Event.countDocuments({
      course: course
    });

    const date = new Date();

    const upcomingEvents = await Event.countDocuments({
      course: course,
      status: "approved",
      date: { $gte: date }
    });

    const totalStudents = await User.countDocuments({
      course: course,
      role: "student"
    });

    const events = await Event.find({
      course: course
    });

    const totalRegistrations = events.reduce(
      (sum, event) => sum + event.registeredStudent.length,
      0
    );

    res.json({
      totalEvents,
      upcomingEvents,
      totalStudents,
      totalRegistrations
    });

  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      message: "Something went wrong!"
    });
  }
};
const createCoordinatorEvent = async (req, res) => {
  try {
    let imageUrl = "";

    const {
      title,
      description,
      date,
      time,
      venue,
      category,
      capacity
    } = req.body;

    if (
      !title ||
      !description ||
      !date ||
      !time ||
      !venue?.trim() ||
      !capacity
    ) {
      return res.status(400).json({
        message: "All fields are required!"
      });
    }

    if (
      !Number.isInteger(Number(capacity)) ||
      Number(capacity) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be positive number"
      });
    }

    if (req.file) {
      imageUrl = await uploadFile(req.file);
    }

    const newEvent = new Event({
      title,
      description,
      date,
      time,
      venue,
      category,
      course: req.user.course,

      capacity,
      image: imageUrl,
      status: "approved"
    });

    await newEvent.save();

    return res.status(201).json({
      message: "Event created successfully",
      newEvent
    });

  } catch (err) {
    console.log(err.message);

    return res.status(500).json({
      message: "Something went wrong!"
    });
  }
};


module.exports = {
  departmentStudents,
  getStudentFromEvents,
  coordinatorEvents,
  getDashboardStats,
  createCoordinatorEvent
};