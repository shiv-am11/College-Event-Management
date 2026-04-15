const express = require("express");
const protect = require("../Middleware/authMiddleware");
const allowRoles = require("../Middleware/roleMiddleware");

const router = express.Router();

router.get("/dashboard", protect, allowRoles("faculty"), (req, res) => {
  res.json({
    message: "Welcome Faculty !!",
    user: req.user,
  });
});

module.exports = router;
