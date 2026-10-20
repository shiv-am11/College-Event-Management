
const User = require("../models/User");
const Event = require("../models/Event");
const uploadFile = require("../config/imageKit");
const sendEventEmail = require("../config/sendEventEmail");

const departmentStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      course: req.user.course,
    }).select("name email phone course year");

    console.log(
      "Student phone data:",
      students.map((student) => ({
        name: student.name,
        phone: student.phone,
      }))
    );

    return res.json(students);
  } catch (err) {
    console.error("Department students error:", err.message);

    return res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const getStudentFromEvents = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      course: req.user.course,
    })
      .populate(
        "registeredStudent",
        "name email course year phone college"
      )
      .populate("attendedStudents", "_id");

    if (!event) {
      return res.status(404).json({
        message: "Event not found or you don't have access to this event.",
      });
    }

    const attendedIds = new Set(
      (event.attendedStudents || []).map((student) =>
        student._id.toString()
      )
    );

    const students = (event.registeredStudent || [])
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
    console.error("Get event students error:", err.message);
    return res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const coordinatorEvents = async (req, res) => {
  try {
    const courseEvents = await Event.find({
      course: req.user.course,
    }).sort({ createdAt: -1 });

    // Return an empty array when there are no events.
    return res.json(courseEvents);
  } catch (err) {
    console.error("Coordinator events error:", err.message);
    return res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const course = req.user.course;

    const totalEvents = await Event.countDocuments({ course });

    const now = new Date();

    const upcomingEvents = await Event.countDocuments({
      course,
      status: "approved",
      date: { $gte: now },
    });

    const totalStudents = await User.countDocuments({
      course,
      role: "student",
    });

    const events = await Event.find({ course }).select(
      "registeredStudent"
    );

    const totalRegistrations = events.reduce(
      (sum, event) => sum + (event.registeredStudent?.length || 0),
      0
    );

    return res.json({
      totalEvents,
      upcomingEvents,
      totalStudents,
      totalRegistrations,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err.message);
    return res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const createCoordinatorEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      startTime,
      endTime,
      venue,
      category,
      capacity,
      instructions,
      whatsappLink,
    } = req.body;

    // 1. Validate required fields.
    const requiredFields = {
      title,
      description,
      date,
      startTime,
      endTime,
      venue,
      category,
      instructions,
      capacity,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(
        ([, value]) =>
          value == null || String(value).trim() === ""
      )
      .map(([field]) => field);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Please fill all required fields: ${missingFields.join(", ")}`,
      });
    }

    // 2. Validate image before uploading or saving the event.
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an event image.",
      });
    }

    // 3. Validate start and end times (24-hour HH:mm format).
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (
      !timePattern.test(startTime) ||
      !timePattern.test(endTime)
    ) {
      return res.status(400).json({
        message: "Please enter valid start and end times.",
      });
    }

    // HH:mm strings can be compared lexicographically.
    if (startTime >= endTime) {
      return res.status(400).json({
        message: "End time must be later than start time.",
      });
    }

    // 4. Validate capacity.
    const numericCapacity = Number(capacity);

    if (
      !Number.isSafeInteger(numericCapacity) ||
      numericCapacity <= 0
    ) {
      return res.status(400).json({
        message: "Capacity must be a positive whole number.",
      });
    }

    // 5. Validate the date received from the HTML date input.
    if (
      typeof date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      return res.status(400).json({
        message: "Please select a valid event date.",
      });
    }

    const eventDate = new Date(`${date}T00:00:00.000Z`);

    if (
      Number.isNaN(eventDate.getTime()) ||
      eventDate.toISOString().slice(0, 10) !== date
    ) {
      return res.status(400).json({
        message: "Please select a valid event date.",
      });
    }

    const nextDay = new Date(eventDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    // 6. Validate optional WhatsApp invitation link.
    const normalizedWhatsAppLink = (whatsappLink || "").trim();

    if (normalizedWhatsAppLink) {
      try {
        const link = new URL(normalizedWhatsAppLink);

        if (
          link.protocol !== "https:" ||
          link.hostname.toLowerCase() !== "chat.whatsapp.com" ||
          link.username ||
          link.password ||
          link.port
        ) {
          throw new Error("Invalid WhatsApp URL");
        }
      } catch {
        return res.status(400).json({
          message: "Please enter a valid WhatsApp group invitation link.",
        });
      }
    }

    // 7. Normalize the venue and escape regex special characters.
    const normalizedVenue = venue.trim();

    const escapedVenue = normalizedVenue.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    // 8. Find events at the same venue on the same date.
    // Rejected events do not reserve a venue.
    const existingEvents = await Event.find({
      venue: {
        $regex: `^${escapedVenue}$`,
        $options: "i",
      },
      date: {
        $gte: eventDate,
        $lt: nextDay,
      },
      status: {
        $in: ["pending", "approved"],
      },
      startTime: { $exists: true, $ne: "" },
      endTime: { $exists: true, $ne: "" },
    }).select("title startTime endTime");

    const conflictingEvent = existingEvents.find((event) => {
      return (
        startTime < event.endTime &&
        endTime > event.startTime
      );
    });

    if (conflictingEvent) {
      return res.status(409).json({
        code: "VENUE_TIME_CONFLICT",
        message:
          `${normalizedVenue} is already booked from ` +
          `${conflictingEvent.startTime} to ${conflictingEvent.endTime} ` +
          `for "${conflictingEvent.title}". Please choose another venue ` +
          "or a different time slot.",
      });
    }

    const imageUrl = await uploadFile(req.file);

    if (!imageUrl) {
      return res.status(500).json({
        message: "Image upload failed. Please try again.",
      });
    }
    const newEvent = new Event({
      title: title.trim(),
      description: description.trim(),
      date: eventDate,

      time: startTime || time || "",
      startTime,
      endTime,

      venue: normalizedVenue,
      category: category.trim(),
      instructions: instructions.trim(),
      whatsappLink: normalizedWhatsAppLink,
      course: req.user.course,
      capacity: numericCapacity,
      image: imageUrl,
      status: "approved",
    });

    await newEvent.save();

    try {
      const students = await User.find({
        role: "student",
        course: req.user.course,
      }).select("name email phone");
       console.log("Student data:", students);
       res.json(students);


      await sendEventEmail(students, newEvent);
    } catch (emailError) {
      console.error(
        "Event created, but email failed:",
        emailError.message
      );
    }

    return res.status(201).json({
      message: "Event created successfully!",
      newEvent,
    });
  } catch (err) {
    console.error("Create coordinator event error:", err);

    return res.status(500).json({
      message: "Something went wrong while creating the event.",
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
        message: "Event not found or access denied.",
      });
    }

    const isRegistered = event.registeredStudent.some(
      (registeredId) => registeredId.toString() === studentId
    );

    if (!isRegistered) {
      return res.status(400).json({
        message: "Student is not registered for this event.",
      });
    }

    const alreadyAttended = event.attendedStudents.some(
      (attendedId) => attendedId.toString() === studentId
    );

    if (alreadyAttended) {
      return res.status(200).json({
        success: true,
        message: "Attendance is already marked.",
      });
    }

    event.attendedStudents.addToSet(studentId);
    await event.save();

    return res.status(200).json({
      success: true,
      message: "Attendance marked successfully.",
      studentId,
      status: "Attended",
    });
  } catch (err) {
    console.error("Mark attendance error:", err.message);
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
  markAttendance,
};
