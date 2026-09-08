const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim:true,

    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password:{
        type: String,
        required: true
    },
    phone:{
        type:String,
        unique:true,
        sparse:true,
        required: function(){
            return this.role === "student";
        }
    },
    college:{
        type: String,
        trim:true,
        required: function(){
            return this.role === "student";
        }
    },
    course:{
        type:String,
        trim:true,
        enum:["MCA" ,"BCA", "BBA","BA ECO" ],
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
    year:{
        type:String,
        trim:true,
        enum:["1st Year" ,"2nd Year","3rd Year"],
        required: function(){
            return this.role === "student";
        }
    },
    }, {timestamps: true});
    module.exports = mongoose.model("User", userSchema);