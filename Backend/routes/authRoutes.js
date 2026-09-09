const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/signup", async (req, res) => {

  console.log("SIGNUP ROUTE HIT");
  console.log("SIGNUP BODY:", req.body);

  const {
    name,
    email,
    password,
    role,
    adminPin,
    phone,
    college,
    year,
    course,
  } = req.body;

  try {
    if (role === "admin") {

      if (!adminPin) {
        return res.status(400).json({
          message: "Admin PIN is required!",
        });
      }

      if (adminPin !== process.env.ADMIN_PIN) {
        return res.status(403).json({
          message: "Invalid Admin PIN",
        });
      }
    }

    if (
      (role === "student" || role === "coordinator") &&
      !course
    ) {
      return res.status(400).json({
        message: "Course is required!",
      });
    }

    if (role === "student" && !year) {
      return res.status(400).json({
        message: "Year is required!",
      });
    }

    const courseDuration = {
      MCA: 2,
      BCA: 3,
      BBA: 3,
      "BA ECO": 3,
    };

    if (role === "student") {

      const duration = courseDuration[course];

      const selectedYear = Number(year[0]);

      if (
        !duration ||
        selectedYear > duration
      ) {
        return res.status(400).json({
          message: `Invalid year for ${course}`,
        });
      }
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    let userData = {
      name,
      email,
      password: hashedPassword,
      role,
    };
    if (role === "student") {

      userData.phone = phone;
      userData.college = college;
      userData.course = course;
      userData.year = year;

    }

    if (role === "coordinator") {
      userData.course = course;
    }
    console.log(
      "USER DATA BEFORE CREATE:",
      userData
    );
    await User.create(userData);


    return res.status(201).json({
      message: "User registered successfully",
    });

  } catch (error) {

    console.log("SIGNUP ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });

  }

});
router.post("/login", async (req, res) => {

  console.log("LOGIN BODY:", req.body);

  const { email, password } = req.body;

  try {

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }


    const token = jwt.sign(

      {
        id: user._id,
        role: user.role,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "1d",
      }

    );


    res.json({

      token,

      role: user.role,

      user: {

        id: user._id,
        name: user.name,
        email: user.email,
        course: user.course,

      },

    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

});


module.exports = router;