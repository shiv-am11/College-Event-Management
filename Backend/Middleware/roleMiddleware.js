const allowRoles = (...roles) => {
  return (req, res, next) => {
    console.log("🔥 ROLE MIDDLEWARE HIT 🔥");
    console.log("EXPECTED 👉", roles);
    console.log("ACTUAL 👉", req.user.role);

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied: insufficient permissions",
      });
    }
    next();
  };
};

module.exports = allowRoles;