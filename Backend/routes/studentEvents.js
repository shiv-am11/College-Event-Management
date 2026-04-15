const express = require("express");
const Event = require("../models/Event");
const protect = require("../Middleware/authMiddleware");
const router = express.Router();

router.get("/events", async(req ,res)=>{
   try{
    const events = await Event.find({status: "approved"});
    res.json({events});
   }catch(err){
    res.status(500).json({message: "Server error"})
   }
});

router.post("/events/:id/register",protect,async(req, res)=>{
   try{
   const userId = req.user.id;
   const event = await Event.findById(req.params.id);

   if(!event){
      return res.status(400).json({message : "Event not Found"});
   }
   if(event.registeredStudent.includes(userId)){
      return res.status(400).json({message:"User Already Exist"});
   }
   if(event.attendees >= event.capacity){
      return res.status(400).json({message:"Event Already full"});
   }
   event.registeredStudent.push(userId);
   event.attendees += 1;

   await event.save();

   res.json({message : "Registered Successfully",event});
}catch(err){
   console.err(err);
   res.status(500).json({message : "Server error"});
}
})
module.exports = router;
