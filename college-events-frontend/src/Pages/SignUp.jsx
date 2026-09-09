import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../CSS/SignUp.css";

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

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminPin, setAdminPin] = useState("");

  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");

  // Course and Year
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");

  // ==========================================
  // ROLE CHANGE
  // ==========================================

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);

    // Reset role-specific fields
    setAdminPin("");
    setPhone("");
    setCollege("");
    setCourse("");
    setYear("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (role === "student") {
      if (!phone.trim()) {
        alert("Please enter phone number");
        return;
      }

      if (!college.trim()) {
        alert("Please enter college name");
        return;
      }

      if (!course) {
        alert("Please select course");
        return;
      }

      if (!year) {
        alert("Please select year");
        return;
      }
    }
    if (role === "coordinator") {
      if (!course) {
        alert("Please select course");
        return;
      }
    }
    if (role === "admin") {
      if (!adminPin) {
        alert("Admin PIN is required");
        return;
      }
    }

    try {
      const payload = {
        name,
        email,
        password,
        role,
      };

      if (role === "admin") {
        payload.adminPin = adminPin;
      }

      if (role === "student") {
        payload.phone = phone;
        payload.college = college;
        payload.course = course;
        payload.year = year;
      }
      if (role === "coordinator") {
        payload.course = course;
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/signup`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Signup failed");
        return;
      }

      alert("Account created successfully!!");
      setName("");
      setEmail("");
      setPassword("");
      setAdminPin("");
      setPhone("");
      setCollege("");
      setCourse("");
      setYear("");
    } catch (error) {
      console.error(error);

      alert("Server error ");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-form">

        <div className="form-container">

          <Link
            to="/"
            className="logo-S"
          >
            <div className="logo-icon">
              <GraduationCap size={22} />
            </div>

            <span>
              CampusHub
            </span>
          </Link>

          <h1>
            Create an account
          </h1>

          <p className="Sub-line">
            Join CampusHub to discover and
            participate in campus events.
          </p>

          <div className="role-section">

            <label className="Select-role">
              I am a
            </label>

            <div className="role-options">

              {/* STUDENT */}

              <button
                type="button"
                className={`role-card ${
                  role === "student"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleRoleChange("student")
                }
              >
                <GraduationCap />

                <span>
                  Student
                </span>
              </button>


              <button
                type="button"
                className={`role-card ${
                  role === "faculty"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleRoleChange("faculty")
                }
              >
                <Briefcase />

                <span>
                  Faculty
                </span>
              </button>

              <button
                type="button"
                className={`role-card ${
                  role === "coordinator"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleRoleChange("coordinator")
                }
              >
                <UserStar />

                <span>
                  Coordinator
                </span>
              </button>


              <button
                type="button"
                className={`role-card ${
                  role === "admin"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleRoleChange("admin")
                }
              >
                <UserCog />

                <span>
                  Admin
                </span>
              </button>

            </div>
          </div>


    
          <form onSubmit={handleSubmit}>

     
            <div className="input-group">

              <label>
                Full Name
              </label>

              <div className="input-wrapper">

                <User />

                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                />

              </div>
            </div>


              <div className="input-group">

              <label>
                Email Address
              </label>

              <div className="input-wrapper">

                <Mail />

                <input
                  type="email"
                  placeholder="Email ID"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />

              </div>
            </div>

            <div className="input-group">

              <label>
                Password
              </label>

              <div className="input-wrapper">

                <Lock />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  className="eye-btn"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword ? (
                    <EyeOff />
                  ) : (
                    <Eye />
                  )}
                </button>

              </div>
            </div>

            {role === "admin" && (

              <div className="input-group">

                <label>
                  Admin PIN
                </label>

                <div className="input-wrapper">

                  <Shield />

                  <input
                    type="password"
                    placeholder="Enter Admin PIN"
                    value={adminPin}
                    onChange={(e) =>
                      setAdminPin(
                        e.target.value
                      )
                    }
                    required
                  />

                </div>

              </div>

            )}

            {role === "student" && (

              <>

                <div className="input-group">

                  <label>
                    Phone Number
                  </label>

                  <div className="input-wrapper">

                    <Phone />

                    <input
                      type="tel"
                      placeholder="Enter Phone Number"
                      value={phone}
                      onChange={(e) =>
                        setPhone(
                          e.target.value
                        )
                      }
                      required
                    />

                  </div>

                </div>

                <div className="input-group">

                  <label>
                    College Name
                  </label>

                  <div className="input-wrapper">

                    <GraduationCap />

                    <input
                      type="text"
                      placeholder="Enter College Name"
                      value={college}
                      onChange={(e) =>
                        setCollege(
                          e.target.value
                        )
                      }
                      required
                    />

                  </div>

                </div>

              </>

            )}

            {(role === "student" ||
              role === "coordinator") && (

              <div className="input-group">

                <label>
                  Course
                </label>

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

                    <option value="">
                      Select Course
                    </option>

                    <option value="MCA">
                      MCA
                    </option>

                    <option value="BCA">
                      BCA
                    </option>

                    <option value="BBA">
                      BBA
                    </option>

                    <option value="BA ECO">
                      BA ECO
                    </option>

                  </select>

                </div>

              </div>

            )}


            {role === "student" && (

              <div className="input-group">

                <label>
                  Year
                </label>

                <div className="input-wrapper">

                  <GraduationCap />

                  <select
                    className="signup-select"
                    value={year}
                    onChange={(e) =>
                      setYear(e.target.value)
                    }
                    required
                  >

                    <option value="">
                      Select Year
                    </option>

                    <option value="1st Year">
                      1st Year
                    </option>

                    <option value="2nd Year">
                      2nd Year
                    </option>


                    {course !== "MCA" && (
                      <option value="3rd Year">
                        3rd Year
                      </option>
                    )}

                  </select>

                </div>

              </div>

            )}
            <button
              type="submit"
              className="submit-btn"
            >
              Create Account
            </button>

          </form>

          <p className="login-link">

            Already have an account?{" "}

            <Link to="/Login">
              Sign in
            </Link>

          </p>

        </div>
      </div>

      <div className="signup-illustration">

        <div className="illustration-content">

          <div className="icon-circle">

            <GraduationCap
              size={40}
            />

          </div>

          <h2>
            Join Your Campus Community
          </h2>

          <p>
            Discover events, connect with peers,
            and enjoy your college journey.
          </p>

        </div>

      </div>

    </div>
  );
};

export default Signup;
