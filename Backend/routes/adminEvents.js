const express = require("express");
const protect = require("../Middleware/authMiddleware");
const allowRoles = require("../Middleware/roleMiddleware");
const Event = require("../models/Event");
const uploadFile = require("../config/imageKit");
const createNotification = require("../utils/notificationLogger");

const router = express.Router();
const upload = require("../Middleware/upload");

const logRejectedNotifications = (results, recipients, context) => {
  results.forEach((result, index) => {
    if (result.status !== "rejected") return;

    const recipientId = recipients[index]?._id || recipients[index];
    const error = result.reason;
    console.error(
      `${context} failed for recipient ${recipientId}:`,
      error?.stack || error?.message || error
    );
  });
};

router.post(
  "/events",
  protect,
  allowRoles("admin"),
  upload.single("image"),
  async (req, res) => {
    try {
      let imageUrl = "";

      const {
        title,
        description,
        date,
        time,
        venue,
        category,
        course,
        capacity,
      } = req.body || {};

      if (
        !title?.trim() ||
        !date ||
        !time ||
        !venue?.trim() ||
        !capacity ||
        !course?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "All fields are required!",
        });
      }

      if (
        !Number.isInteger(Number(capacity)) ||
        Number(capacity) <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Capacity must be positive number",
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
        course,
        capacity,
        image: imageUrl,
        status: "approved",
      });

      await newEvent.save();

      try {
        const students = await require("../models/User")
          .find({ role: "student", course })
          .select("_id");

        const notificationResults = await Promise.allSettled(
          students.map((student) =>
            createNotification({
              recipient: student._id,
              recipientRole: "student",
              title: "New Event Available",
              message: `A new event, "${newEvent.title}", is available for ${newEvent.course} students.`,
              type: "event_created",
              relatedEvent: newEvent._id,
              dedupeKey: `event_created:${newEvent._id}:${student._id}`,
            })
          )
        );
        logRejectedNotifications(
          notificationResults,
          students,
          "Admin event-created notification"
        );
      } catch (notificationError) {
        console.error("Admin event notification error:", notificationError.message);
      }

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

router.get(
  "/events",
  protect,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const events = await Event.find().sort({ date: 1 });

      res.json({
        success: true,
        events,
      });

    } catch (err) {
      console.log("GET EVENTS ERROR ", err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);
router.put(
  "/events/:id",
  protect,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const previousEvent = await Event.findById(req.params.id).select(
        "date time venue registeredStudent"
      );

      if (!previousEvent) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      const event = await Event.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      const changedFields = ["date", "time", "venue"].filter((field) => {
        if (!Object.prototype.hasOwnProperty.call(req.body || {}, field)) {
          return false;
        }

        const previousValue = previousEvent[field];
        const nextValue = event[field];

        if (field === "date") {
          return (
            new Date(previousValue).getTime() !==
            new Date(nextValue).getTime()
          );
        }

        return String(previousValue || "") !== String(nextValue || "");
      });

      if (changedFields.length > 0) {
        const dateText = event.date
          ? new Date(event.date).toLocaleDateString("en-IN")
          : "TBA";
        const timeText = event.time || event.startTime || "TBA";
        const venueText = event.venue || "TBA";
        const dedupeSuffix = JSON.stringify({
          changedFields,
          date: event.date ? new Date(event.date).toISOString() : null,
          time: timeText,
          venue: venueText,
        });

        await Promise.all(
          (event.registeredStudent || []).map(async (studentId) => {
            try {
              await createNotification({
                recipient: studentId,
                recipientRole: "student",
                title: "Event Details Updated",
                message:
                  `The event "${event.title}" has updated details. ` +
                  `Date: ${dateText}; Time: ${timeText}; Venue: ${venueText}.`,
                type: "event_updated",
                relatedEvent: event._id,
                dedupeKey: `event_updated:${event._id}:${studentId}:${dedupeSuffix}`,
              });
            } catch (notificationError) {
              console.error(
                "Event update notification error:",
                notificationError
              );
            }
          })
        );
      }

      const cancellationRecipients = event.registeredStudent || [];
      const cancellationNotificationResults = await Promise.allSettled(
        cancellationRecipients.map((studentId) =>
          createNotification({
            recipient: studentId,
            recipientRole: "student",
            title: "Event Cancelled",
            message: `The event "${event.title}" has been cancelled.`,
            type: "event_cancelled",
            relatedEvent: event._id,
            dedupeKey: `event_cancelled:${event._id}:${studentId}`,
          })
        )
      );
      logRejectedNotifications(
        cancellationNotificationResults,
        cancellationRecipients,
        "Event-cancelled notification"
      );

      res.json({
        success: true,
        message: "Event updated successfully",
        event,
      });

    } catch (err) {
      console.log("UPDATE EVENT ERROR ", err);

      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }
);
router.delete(
  "/events/:id",
  protect,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const event = await Event.findByIdAndDelete(req.params.id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      res.json({
        success: true,
        message: "Event deleted successfully",
      });

    } catch (err) {
      console.log("DELETE EVENT ERROR ", err);

      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }
);

router.get(
  "/event/:id/registrations",
  protect,
  allowRoles("admin"),
  async (req, res) => {
    try {
      console.log("EVENT ID:", req.params.id);

      const event = await Event.findById(req.params.id).populate({
        path: "registeredStudent",
        select: "name email phone college course year",
      });

      if (!event) {
        return res.status(404).json({
          message: "Event not found",
        });
      }

      res.json({
        eventId: event._id,
        total: event.registeredStudent.length,
        students: event.registeredStudent,
      });

    } catch (err) {
      console.error("BACKEND ERROR:", err);

      res.status(500).json({
        message: err.message,
      });
    }
  }
);


module.exports = router;
