import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Calendar, Mail, Lock ,GraduationCap,Briefcase,UserCog} from "lucide-react";
import "../CSS/Login.css";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role , setRole] = useState("student");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const res = await fetch("http://localhost:3000/api/auth/login",{
        method:"POST",
        headers:{
          "Content-Type": "application/json",
        },
        body:JSON.stringify({
          email,
          password,
          role,
        })
      })
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }
      localStorage.setItem("token", data.token);

       if (data.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else if (data.role === "faculty") {
        window.location.href = "/faculty/dashboard";
      } else {
        window.location.href = "/student/dashboard";
      }
    }catch(error){
      alert("Something went wrong");
    }
  };

  return (
    <div className="main-login-page">
      {/* Left Side */}
      <div className="login-form">
        <div className="main-form-container">
          {/* Logo */}
          <Link to="/" className="main-logo-Login">
            <div className="login-logo-icon">
              <GraduationCap size={22} />
            </div>
            <span>CampusHub</span>
          </Link>

          <h1>Welcome Back</h1>
          <p className="Sub-lines">
            Sign in to access your dashboard and manage events.
          </p>

          {/* ROLE BUTTONS */}
          <div className="Login-role-options">
            <button
              type="button"
              className={`Login-role-card ${role === "student" ? "active-role" : ""}`}
              onClick={() => setRole("student")}
            >
              <GraduationCap />
              <span>Student</span>
            </button>

            <button
              type="button"
              className={`Login-role-card ${role === "faculty" ? "active-role" : ""}`}
              onClick={() => setRole("faculty")}
            >
              <Briefcase />
              <span>Faculty</span>
            </button>

            <button
              type="button"
              className={`Login-role-card ${role === "admin" ? "active-role" : ""}`}
              onClick={() => setRole("admin")}
            >
              <UserCog />
              <span>Admin</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
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

            {/* Password */}
            <div className="input-group">
              <div className="label-row">
                <label>Password</label>
                <Link to="/forgot-password" className="forgot">
                  Forgot password?
                </Link>
              </div>

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

            <button className="submit-btn" type="submit">
              Log In as {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          </form>

          <p className="signup-link">
            Don't have an account? <Link to="/signup">Sign up for free</Link>
          </p>
        </div>
      </div>

      {/* Right Side Illustration */}
      <div className="login-illustration">
        <div className="illustration-content">
          <div className="icon-circle">
            <Calendar size={40} />
          </div>
          <h2>Manage Events Seamlessly</h2>
          <p>
            Access your personalized dashboard to view registered events,
            upcoming activities, and earned certificates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
