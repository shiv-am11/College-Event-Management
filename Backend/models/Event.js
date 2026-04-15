const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: String,
  time: String,
  venue: String,
  category: String,
  attendees: { type: Number, default: 0 },
  capacity: { type: Number, required: true },
  image: String,
  status: { type: String, default: "approved" }, 
  registeredStudent:[
 {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
 }
],
default :[],
});



module.exports = mongoose.model("Event", EventSchema);
