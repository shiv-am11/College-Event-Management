import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Eye,
  EyeOff,
  Calendar,
  Mail,
  Lock,
  GraduationCap
} from "lucide-react";

import "../CSS/Login.css";

const Login = () => {

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          email,
          password
        }
      );

      const data = res.data;

      localStorage.setItem("token", data.token);

      // Backend se role aa raha hai
      if (data.role === "admin") {

        window.location.href = "/admin/dashboard";

      } else if (data.role === "faculty") {

        window.location.href = "/faculty/dashboard";

      } else if (data.role === "coordinator") {

        window.location.href = "/coordinator/dashboard";

      } else {

        window.location.href = "/student/dashboard";

      }

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Something went wrong"
      );
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

                <Link
                  to="/forgot-password"
                  className="forgot"
                >
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
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>

              </div>

            </div>


            <button
              className="submit-btn"
              type="submit"
            >
              Login
            </button>

          </form>


          <p className="signup-link">

            Don't have an account?

            <Link to="/signup">
              Sign up for free
            </Link>

          </p>

        </div>

      </div>


      {/* Right Side Illustration */}
      <div className="login-illustration">

        <div className="illustration-content">

          <div className="icon-circle">
            <Calendar size={40} />
          </div>

          <h2>
            Manage Events Seamlessly
          </h2>

          <p>
            Access your personalized dashboard to view
            registered events, upcoming activities,
            and earned certificates.
          </p>

        </div>

      </div>

    </div>
  );
};

export default Login;