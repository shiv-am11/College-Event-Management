const express = require("express");
const protect = require("../Middleware/authMiddleware");
const allowRoles = require("../Middleware/roleMiddleware");

const {
  departmentStudents,
  getStudentFromEvents,
  coordinatorEvents,
  getDashboardStats,
  createCoordinatorEvent,
  markAttendance,
  confirmParticipation,
  issueCertificate,
} = require("../Controller/coordinatorController");
const upload = require("../Middleware/upload");

const router = express.Router();

router.get("/my-students", protect, allowRoles("coordinator"), departmentStudents);
router.get("/event/:id/students", protect, allowRoles("coordinator"), getStudentFromEvents);
router.get("/events", protect, allowRoles("coordinator"), coordinatorEvents);
router.get("/dashboard-stats", protect, allowRoles("coordinator"), getDashboardStats);
router.post(
  "/createEvent-coordinator",
  protect,
  allowRoles("coordinator"),
  upload.single("image"),
  createCoordinatorEvent
);
router.patch(
  "/event/:id/students/:studentId/attendance",
  protect,
  allowRoles("coordinator"),
  markAttendance
);
router.patch(
  "/event/:id/students/:studentId/participation",
  protect,
  allowRoles("coordinator"),
  confirmParticipation
);
router.patch(
  "/event/:id/students/:studentId/certificate",
  protect,
  allowRoles("coordinator"),
  issueCertificate
);
router.get("/department-students", protect, departmentStudents);

module.exports = router;
