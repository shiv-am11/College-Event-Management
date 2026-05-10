const express = require("express");
const protect = require("../Middleware/authMiddleware");
const allowRoles = require("../Middleware/roleMiddleware");
const router = express.Router();
const Event = require("../models/Event");
const User = require("../models/User");

router.get("/my-students", protect ,allowRoles("coordinator"), async(req ,res)=>{
    try{
       const students = await User.find({
        role: "student",
        department : req.user.department
       }).select("name email department")
       res.json(students);
    }catch(err){
      console.error(err)
      res.status(500).json({message :"Server error"});
    }
})

router.get("/event/:id/studetns" ,protect , allowRoles("coordinator") ,async(req ,res)=>{
    try{
        const event = await Event.findById(req.params.id)
        .populate("registeredStudent", "name email department");

        if(!event){
            return  res.status(404).json({message :" Event not Found"});
        }
        const filteredStudents = event.registeredStudent.filter(
        (student) => student.department === req.user.department
         );

         res.json(filteredStudents);

        }catch(err){
        console.error(err)
        res.status(500).json({message: 'Server error'})
        }
})
router.get(
  "/events",
  protect,
  allowRoles("coordinator"),
  async (req, res) => {
    try {
      const events = await Event.find({
        department: req.user.department,
      }).sort({ createdAt: -1 });

      res.json({ events });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);
router.get(
  "/dashboard-stats",
  protect,
  allowRoles("coordinator"),
  async (req, res) => {
    try {
      const dept = req.user.department;

      // Total events
      const totalEvents = await Event.countDocuments({
        department: dept,
      });

      // Upcoming events
      const upcomingEvents = await Event.countDocuments({
        department: dept,
        status: "approved",
      });

      // Department students
      const totalStudents = await User.countDocuments({
        department: dept,
        role: "student",
      });

      // Total registrations (sum of all registeredStudents)
      const events = await Event.find({ department: dept });

      const totalRegistrations = events.reduce(
        (sum, event) => sum + event.registeredStudent.length,
        0
      );

      res.json({
        totalEvents,
        upcomingEvents,
        totalStudents,
        totalRegistrations,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);
module.exports = router;
