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
    const event = await Event.findOne({
      _id: req.params.id,
      course: req.user.course,
    })
      .populate("registeredStudent", "name email course year phone college")
      .populate("attendedStudents", "_id");

    if (!event) {
      return res.status(404).json({
        message: "Event not found or you don't have access to this event",
      });
    }

    const attendedIds = new Set(
      (event.attendedStudents || []).map(
        (student) => student._id.toString()
      )
    );

    const students = event.registeredStudent
      .filter((student) => student.course === req.user.course)
      .map((student) => ({
        _id: student._id,
        name: student.name,
        email: student.email,
        course: student.course,
        year: student.year,
        phone: student.phone || "N/A",
        college: student.college || "N/A",
        status: attendedIds.has(student._id.toString())
          ? "Attended"
          : "Registered",
      }));

    return res.json(students);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      message: "Something went wrong!",
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
      capacity,
      instructions,
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
      instructions,
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
const markAttendance = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    const event = await Event.findOne({
      _id: id,
      course: req.user.course,
    }).select("registeredStudent attendedStudents");

    if (!event) {
      return res.status(404).json({
        message: "Event not found or access denied",
      });
    }

    const isRegistered = event.registeredStudent.some(
      (registeredId) => registeredId.toString() === studentId
    );

    if (!isRegistered) {
      return res.status(400).json({
        message: "Student is not registered for this event",
      });
    }

    const alreadyAttended = event.attendedStudents.some(
      (attendedId) => attendedId.toString() === studentId
    );

    if (alreadyAttended) {
      return res.status(200).json({
        success: true,
        message: "Attendance is already marked",
      });
    }

    event.attendedStudents.addToSet(studentId);
    await event.save();

    return res.status(200).json({
      success: true,
      message: "Attendance marked successfully",
      studentId,
      status: "Attended",
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      message: "Something went wrong!",
    });
  }
}; 


module.exports = {
  departmentStudents,
  getStudentFromEvents,
  coordinatorEvents,
  getDashboardStats,
  createCoordinatorEvent,
  markAttendance
};