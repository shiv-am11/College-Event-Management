import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Eye,
  EyeOff,
  Calendar,
  Mail,
  Lock,
  GraduationCap,
} from "lucide-react";

import { notify, LoadingOverlay } from "../Components/ToastHost";
import "../CSS/Login.css";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { email: email.trim(), password }
      );

      const data = res.data;

      if (!data.token) {
        notify(
          "The server did not return a login token.",
          "error",
          "Login Failed"
        );
        return;
      }

      localStorage.setItem("token", data.token);

      const dashboardRoutes = {
        admin: "/admin/dashboard",
        faculty: "/faculty/dashboard",
        coordinator: "/coordinator/dashboard",
        student: "/student/dashboard",
      };

      const destination = dashboardRoutes[data.role];

      if (!destination) {
        notify(
          "Your account has an unrecognized role. Please contact support.",
          "error",
          "Invalid Account Role"
        );
        return;
      }

      notify(
        `Welcome back! Opening your ${data.role} dashboard.`,
        "success",
        "Login Successful"
      );

      // Keep the toast visible briefly before navigating.
      window.setTimeout(() => {
        window.location.href = destination;
      }, 900);
    } catch (error) {
      console.error("Login error:", error);

      notify(
        error.response?.data?.message ||
          "Unable to login. Please check your details and try again.",
        "error",
        "Login Failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="main-login-page">
      {isSubmitting && (
        <LoadingOverlay message="Signing you in..." />
      )}

      <div className="login-form">
        <div className="main-form-container">
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

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email Address</label>

              <div className="input-wrapper">
                <Mail />
                <input
                  type="email"
                  placeholder="Email ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

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
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <button
              className="submit-btn"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing In..." : "Login"}
            </button>
          </form>

          <p className="signup-link">
            Don't have an account? <Link to="/SignUp">Sign up for free</Link>
          </p>
        </div>
      </div>

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
