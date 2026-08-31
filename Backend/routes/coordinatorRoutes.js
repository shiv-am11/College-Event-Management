const express = require("express")
const protect = require("../Middleware/authMiddleware");
const allowRoles = require("../Middleware/roleMiddleware");

const {
    departmentStudents,
    getStudentFromEvents,
    coordinatorEvents,
    getDashboardStats,
    createCoordinatorEvent
} = require("../Controller/coordinator.controller");
const upload = require("../Middleware/upload");

const router = express.Router();

router.get("/my-students" ,protect,allowRoles("coordinator"),departmentStudents)
router.get("/event/:id/students" ,protect,allowRoles("coordinator"),getStudentFromEvents)
router.get("/events" ,protect,allowRoles("coordinator"),coordinatorEvents)
router.get("/dashboard-stats" ,protect,allowRoles("coordinator"),getDashboardStats)
router.post("/createEvent-coordinator", protect,allowRoles("coordinator"),upload.single("image"),createCoordinatorEvent)
module.exports =router;