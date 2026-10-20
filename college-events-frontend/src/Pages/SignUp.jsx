
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  GraduationCap,
  Briefcase,
  UserCog,
  Shield,
  Phone,
  UserStar,
} from "lucide-react";

import { notify, LoadingOverlay } from "../Components/ToastHost";
import "../CSS/SignUp.css";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleChange = (selectedRole) => {
    if (isSubmitting) return;

    setRole(selectedRole);
    setAdminPin("");
    setPhone("");
    setCollege("");
    setCourse("");
    setYear("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!name.trim() || !email.trim() || !password) {
      notify(
        "Please fill in your name, email and password.",
        "warning",
        "Missing Information"
      );
      return;
    }

    if (role === "student") {
      if (!phone.trim() || !college.trim() || !course || !year) {
        notify(
          "Please complete your phone, college, course and year details.",
          "warning",
          "Missing Information"
        );
        return;
      }
    }

    if (role === "coordinator" && !course) {
      notify("Please select a course.", "warning", "Course Required");
      return;
    }

    if (role === "admin" && !adminPin.trim()) {
      notify("Please enter the Admin PIN.", "warning", "PIN Required");
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      password,
      role,
    };

    if (role === "admin") {
      payload.adminPin = adminPin;
    }

    if (role === "student") {
      payload.phone = phone.trim();
      payload.college = college.trim();
      payload.course = course;
      payload.year = year;
    }

    if (role === "coordinator") {
      payload.course = course;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        notify(
          data.message || "Unable to create your account.",
          "error",
          "Signup Failed"
        );
        return;
      }

      const roleLabels = {
        student: "Student",
        faculty: "Faculty",
        coordinator: "Coordinator",
        admin: "Admin",
      };

      notify(
        `${roleLabels[role]} account created successfully.`,
        "success",
        "Account Created"
      );

      setName("");
      setEmail("");
      setPassword("");
      setAdminPin("");
      setPhone("");
      setCollege("");
      setCourse("");
      setYear("");
      setShowPassword(false);
    } catch (error) {
      console.error("Signup error:", error);

      notify(
        "Unable to connect to the server. Please try again.",
        "error",
        "Server Error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      {isSubmitting && (
        <LoadingOverlay
          message={`Creating your ${role} account...`}
        />
      )}

      <div className="signup-form">
        <div className="form-container">
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

          <div className="role-section">
            <label className="Select-role">I am a</label>

            <div className="role-options">
              <button
                type="button"
                className={`role-card ${role === "student" ? "active" : ""}`}
                onClick={() => handleRoleChange("student")}
                disabled={isSubmitting}
              >
                <GraduationCap />
                <span>Student</span>
              </button>

              <button
                type="button"
                className={`role-card ${role === "faculty" ? "active" : ""}`}
                onClick={() => handleRoleChange("faculty")}
                disabled={isSubmitting}
              >
                <Briefcase />
                <span>Faculty</span>
              </button>

              <button
                type="button"
                className={`role-card ${role === "coordinator" ? "active" : ""}`}
                onClick={() => handleRoleChange("coordinator")}
                disabled={isSubmitting}
              >
                <UserStar />
                <span>Coordinator</span>
              </button>

              <button
                type="button"
                className={`role-card ${role === "admin" ? "active" : ""}`}
                onClick={() => handleRoleChange("admin")}
                disabled={isSubmitting}
              >
                <UserCog />
                <span>Admin</span>
              </button>
            </div>
          </div>

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
                  autoComplete="name"
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
                  autoComplete="email"
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
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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

            {role === "admin" && (
              <div className="input-group">
                <label>Admin PIN</label>
                <div className="input-wrapper">
                  <Shield />
                  <input
                    type="password"
                    placeholder="Enter Admin PIN"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {role === "student" && (
              <>
                <div className="input-group">
                  <label>Phone Number</label>
                  <div className="input-wrapper">
                    <Phone />
                    <input
                      type="tel"
                      placeholder="Enter Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
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

            {(role === "student" || role === "coordinator") && (
              <div className="input-group">
                <label>Course</label>
                <div className="input-wrapper">
                  <GraduationCap />
                  <select
                    className="signup-select"
                    value={course}
                    onChange={(e) => {
                      setCourse(e.target.value);
                      setYear("");
                    }}
                    required
                  >
                    <option value="">Select Course</option>
                    <option value="MCA">MCA</option>
                    <option value="BCA">BCA</option>
                    <option value="BBA">BBA</option>
                    <option value="BA ECO">BA ECO</option>
                  </select>
                </div>
              </div>
            )}

            {role === "student" && (
              <div className="input-group">
                <label>Year</label>
                <div className="input-wrapper">
                  <GraduationCap />
                  <select
                    className="signup-select"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    {course !== "MCA" && (
                      <option value="3rd Year">3rd Year</option>
                    )}
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="login-link">
            Already have an account? <Link to="/Login">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="signup-illustration">
        <div className="illustration-content">
          <div className="icon-circle">
            <GraduationCap size={40} />
          </div>
          <h2>Join Your Campus Community</h2>
          <p>
            Discover events, connect with peers, and enjoy your college journey.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
