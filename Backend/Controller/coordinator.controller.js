const User = require("../models/User")
const Event = require("../models/Event");
const uploadFile = require("../config/imageKit");

const departmentStudents = async(req,res)=>{
    try{
       const students = await User.find({
          role:"student",
          department:req.user.department
       }).select("name email department")
       res.json(students);
    }catch(err){
        console.log(err.message)
        return res.status(500).json({message:"Something went wrong!"})
    }
}
const getStudentFromEvents = async(req, res)=>{
    try{
        const fetchStudent = await Event.findOne({
            _id: req.params.id,
            department: req.user.department
        }).populate("registeredStudent", "name email department");

        if(!fetchStudent){
            return res.status(404).json({message:"Event not found or you don't have access to this event"})
        }
        const departmentStudent = fetchStudent.registeredStudent.filter((student)=> student.department === req.user.department)
        res.json(departmentStudent);
    }catch(err){
        console.log(err.message)
        return res.status(500).json({message:"Something went wrong!"})
}
}
const coordinatorEvents = async(req ,res)=>{
    try{
        const departmentEvnts = await Event.find({
            department: req.user.department
        }).sort({createdAt: -1})
        
        if(departmentEvnts.length === 0){
            return res.status(404).json({message:"No event found "})
        }

        res.json(departmentEvnts);

    }catch(err){
        console.log(err.message)
        return res.status(500).json({message:"Something went wrong!"})
    }
}
const getDashboardStats = async(req , res)=>{
    try{
        const dept = req.user.department;

        const totalEvents = await Event.countDocuments({
          department : dept
        })
        
        const date = new Date()
        const upcomingEvents = await Event.countDocuments({
            department: dept,
            status: "approved",
            date:{$gte : date}
        })
        const totalStudents = await User.countDocuments({
            department:dept,
            role:"student"
        })

        const events = await Event.find({department: dept})
        const totalRegistrations = events.reduce((sum, event)=> sum + event.registeredStudent.length,0);

        res.json({
            totalEvents,
            upcomingEvents,
            totalStudents,
            totalRegistrations
        })

    }catch(err){
        console.log(err.message)
        return res.status(500).json({message:"Something went wrong!"})
    }
}
const createCoordinatorEvent = async(req,res)=>{
    try{
        let imageUrl = "";
        const{ title,
        description,
        date,
        time,
        venue,
        category,
        capacity} =req.body;

        if(
          !title||
          !description||
          !date||
          !time||
          !venue?.trim()||
          !capacity ){
            return res.status(400).json({message:"All fields are required!"})
          }
        if(!Number.isInteger(Number(capacity)) || Number(capacity) <= 0){
        return res.status(400).json({success:false , message:"Capacity must be positive number"})
      }
      if(req.file){
        imageUrl = await uploadFile(req.file)
      }

      const newEvent = new Event({
              title,
              description,
              date,
              time,
              venue,
              category,
              department: req.user.department, 
              capacity,
              image: imageUrl,
              status: "approved",
            });

            await newEvent.save();
            return res.status(201).json({message:"Event created successfully" , newEvent})

    }catch(err){
        console.log(err.message)
        return res.status(500).json({message: "Something went wring!"})
    }
}
module.exports={departmentStudents,
               getStudentFromEvents,
               coordinatorEvents,
               getDashboardStats,
               createCoordinatorEvent,

}