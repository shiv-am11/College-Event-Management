const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    phone:{
        type:String,
        unique:true,
        required: function(){
            return this.role === "student";
        }
    },
    college:{
        type: String,
        required: function(){
            return this.role === "student";
        }
    },
    role:{
        type: String,
        enum :["student" , "faculty" , "admin" , "coordinator"],
        default: "student"
    },
    department:{
        type: String,
        required : function(){
            return this.role === "coordinator" || this.role=== "student";
        }
    },
    }, {timestamps: true});
    module.exports = mongoose.model("User", userSchema);