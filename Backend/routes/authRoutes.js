const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// SIGNUP
router.post("/SignUp", async (req, res) => {
  const { name, email, password, role, adminPin ,phone ,college  } = req.body;

  try {
    if(role === "admin"){
      if(!adminPin){
        return res.status(400).json({ message: "Admin PIN is required" });
      }
      if (adminPin !== process.env.ADMIN_PIN) {
        return res.status(403).json({ message: "Invalid Admin PIN" });
      }
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let userData = {
      name, 
      email,
      password: hashedPassword,
      role
    };
    if(role === "student"){
      userData.phone =phone;
      userData.college = college;
    }
     const user = await User.create(userData);

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LOGIN
router.post("/Login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
