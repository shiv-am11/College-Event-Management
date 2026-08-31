const User = require("../models/User")
const bcrypt = require("bcrypt")

const createUser = async(req , res)=>{
    try{
        const {name ,email,password ,phone, role ,department} =req.body;

        if([name ,email,password , role].some((item)=> item?.trim() === "")){
            return res.status(400).json({message:"All fields are required!"})
        }
        if (role === "coordinator" && !department?.trim()) {
           return res.status(400).json({
           message: "Department is required for coordinator"});
        }
        if(!["admin" , "coordinator"].includes(role)){
            return res.status(400).json({
                message:" only admin & coordinator can be created "
            })
        }
        const userExist = await User.findOne({email})
        if(userExist){
            return res.status(400).json({message : "User already exist!"})
        }


        const hashPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashPassword,
            role,
            phone,
            department,
        })
        const createdUser = await User.findById(user._id).select("-password");
        if(!createdUser){
            return res.status(500).json({message: " something went wrong with user "})
        }
        return res.status(201).json({message: `${role} created successfully !`,
         user : createdUser});
    }catch(err){
        console.log(err.message);
        return res.status(500)
        .json({message: " something went wrong"})
    }
}
module.exports={ createUser}