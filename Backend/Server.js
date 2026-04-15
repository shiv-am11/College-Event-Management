const express = require ("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
connectDB();

app.use("/api", require("./routes/testRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/faculty", require("./routes/facultyRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/admin", require("./routes/adminEvents"));
app.use("/api/student" , require("./routes/studentEvents"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/student", require("./routes/studentDashboard"));



app.get("/", (req,res)=>{
    res.send("Backend is running 🚀");
})

const PORT = process.env.PORT ||3000;
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
});