const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const protect = require("../Middleware/authMiddleware");

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
        phone: user.phone || "",
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET /api/auth/me - Retrieve current authenticated user's profile
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("GET /api/auth/me error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
});

// PUT /api/auth/me - Update permitted profile details (name, phone)
router.put("/me", protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 60) {
        return res.status(400).json({
          success: false,
          message: "Full name must be between 2 and 60 characters long.",
        });
      }
      user.name = name.trim();
    }

    // Validate phone if provided
    if (phone !== undefined) {
      const trimmedPhone = String(phone).trim();
      if (trimmedPhone !== "") {
        const phonePattern = /^[0-9]{10}$/;
        if (!phonePattern.test(trimmedPhone)) {
          return res.status(400).json({
            success: false,
            message: "Phone number must be a valid 10-digit number.",
          });
        }

        // Check uniqueness across other accounts
        const existingPhoneUser = await User.findOne({
          phone: trimmedPhone,
          _id: { $ne: user._id },
        });

        if (existingPhoneUser) {
          return res.status(400).json({
            success: false,
            message: "This phone number is already registered by another account.",
          });
        }

        user.phone = trimmedPhone;
      } else {
        if (user.role === "student") {
          return res.status(400).json({
            success: false,
            message: "Phone number is required for students.",
          });
        }
        user.phone = undefined;
      }
    }

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("PUT /api/auth/me error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update profile.",
    });
  }
});

// PUT /api/auth/change-password - Change current user's password
router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide both current and new password.",
      });
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from your current password.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (err) {
    console.error("PUT /api/auth/change-password error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while changing password",
    });
  }
});

module.exports = router;
