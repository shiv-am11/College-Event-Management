import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../CSS/SignUp.css";
import {
  Eye,
  EyeOff,
  Calendar,
  Mail,
  Lock,
  User,
  GraduationCap,
  Briefcase,
  UserCog,
  Shield,
  Phone,
} from "lucide-react";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminPin, setAdminPin] = useState("");

  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole !== "Admin") {
      setAdminPin("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
     if(role ==='student' && (!phone || !college)){
       alert("Please fill all student details");
       return;
     }
    try {
      const res = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: role === "Admin" ? "admin" : role,
          adminPin: role === "Admin" ? adminPin : undefined,
          phone: role === 'student'?phone: undefined,
          college: role === 'student'?college: undefined, 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Signup failed");
        return;
      }

      alert("Account created successfully!!");
    } catch (error) {
      alert("Server error ❌");
      console.error(error);
    }
  };

  return (
    <div className="signup-page">
      {/* Left Side */}
      <div className="signup-form">
        <div className="form-container">
          {/* Logo */}
          <Link to="/" className="logo-S">
            <div className="logo-icon">
              <GraduationCap size={22} />
            </div>
            <span>CampusHub</span>
          </Link>

          <h1>Create an account</h1>
          <p className="Sub-line">
            Join CampusHub to discover and participate in campus events.
          </p>

          {/* Role Selection */}
          <div className="role-section">
            <label className="Select-role">I am a</label>
            <div className="role-options">
              <button
                type="button"
                className={`role-card ${role === "student" ? "active" : ""}`}
                onClick={() => handleRoleChange("student")}
              >
                <GraduationCap />
                <span>Student</span>
              </button>

              <button
                type="button"
                className={`role-card ${role === "faculty" ? "active" : ""}`}
                onClick={() => handleRoleChange("faculty")}
              >
                <Briefcase />
                <span>Faculty</span>
              </button>

              <button
                type="button"
                className={`role-card ${role === "Admin" ? "active" : ""}`}
                onClick={() => handleRoleChange("Admin")}
              >
                <UserCog />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <User />
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail />
                <input
                  type="email"
                  placeholder="Email ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {role === "Admin" && (
              <div className="input-group">
                <label>Admin PIN</label>
                <div className="input-wrapper">
                  <Shield />
                  <input
                    type="password"
                    placeholder="Enter Admin PIN"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                  />
                </div>
                <small className="hint">
                  PIN will be verified during login
                </small>
              </div>
            )}

            {/* Student Extra Fields */}
            {role === "student" && (
             <>
             <div className="input-group">
               <label>Phone Number</label>
               <div className="input-wrapper">
                 <Phone />
                 <input
                   type="text"
                   placeholder="Enter Phone Number"
                   value={phone}
                   onChange={(e) => setPhone(e.target.value)}
                   required
                 />
               </div>
             </div>

          <div className="input-group">
            <label>College Name</label>
            <div className="input-wrapper">
              <GraduationCap />
               <input
                type="text"
                placeholder="Enter College Name"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                required
              />
            </div>
          </div>
        </>
      )}

            <button className="submit-btn">Create Account</button>
          </form>

          <p className="terms">
            By signing up, you agree to our{" "}
            <a href="#">Terms of Service</a> and{" "}
            <a href="#">Privacy Policy</a>
          </p>

          <p className="login-link">
            Already have an account? <Link to="/Login">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="signup-illustration">
        <div className="illustration-content">
          <div className="icon-circle">
            <GraduationCap size={40} />
          </div>
          <h2>Join Your Campus Community</h2>
          <p>
            Discover exciting events, connect with peers, and make the most of
            your college experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
