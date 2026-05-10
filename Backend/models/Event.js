const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: {type: Date , required: true},
  time: String,
  venue: String,
  category: String,
  department: {type: String , required: true},

  attendees: { type: Number, default: 0 },
  capacity: { type: Number, required: true },
  image: String,
  status: { type: String,enum :["pending", "approved", "rejected"] , default: "approved" }, 


  registeredStudent: {
  type: [mongoose.Schema.Types.ObjectId],
  ref: "User",
  default: []
}
});
module.exports = mongoose.model("Event", EventSchema);
