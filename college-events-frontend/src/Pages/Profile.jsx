import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Lock,
} from "lucide-react";

import StudentDashboardLayout from "../Student-Components/layout/StudentDashboardLayout";
import CoordinatorDashboardLayout from "../Coordinator-Components/layout/CoordinatorDashLayout";
import DashboardLayout from "../Admin-Components/Layout/DashboardLayout";
import "../CSS/Profile.css";
import { API_BASE_URL } from "../config/api";

const BASE_URL = API_BASE_URL;

function getInitials(name = "") {
  if (!name || typeof name !== "string") return "U";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function normalizeRole(role = "") {
  const lower = String(role).toLowerCase().trim();
  switch (lower) {
    case "student":
      return "Student";
    case "coordinator":
      return "Coordinator";
    case "faculty":
      return "Faculty";
    case "admin":
      return "Admin";
    default:
      return lower ? lower.charAt(0).toUpperCase() + lower.slice(1) : "User";
  }
}

function formatDate(dateString) {
  if (!dateString) return "Not available";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Not available";
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Not available";
  }
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit Form Fields (Only Name & Phone are editable)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not signed in. Please log in to view your profile.");
        setLoading(false);
        return;
      }

      const res = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success && res.data.user) {
        const u = res.data.user;
        setProfile(u);
        setFormData({
          name: u.name || "",
          phone: u.phone || "",
        });

        // Sync to localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: u._id || u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            phone: u.phone,
          })
        );
        localStorage.setItem("role", u.role);
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load profile. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEditClick = () => {
    setError("");
    setSuccess("");
    setFormData({
      name: profile?.name || "",
      phone: profile?.phone || "",
    });
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setError("");
    setFormData({
      name: profile?.name || "",
      phone: profile?.phone || "",
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate name
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError("Full name must be at least 2 characters long.");
      return;
    }

    // Validate phone (if provided)
    const trimmedPhone = formData.phone.trim();
    if (trimmedPhone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(trimmedPhone)) {
        setError("Please enter a valid 10-digit phone number.");
        return;
      }
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${BASE_URL}/api/auth/me`,
        {
          name: formData.name.trim(),
          phone: trimmedPhone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success && res.data.user) {
        const updated = res.data.user;
        setProfile(updated);
        setSuccess("Profile updated successfully!");
        setIsEditing(false);

        // Update localStorage
        localStorage.setItem("user", JSON.stringify(updated));

        // Dispatch custom event to notify UserProfileDropdown in top navbar immediately!
        window.dispatchEvent(
          new CustomEvent("userProfileUpdated", { detail: updated })
        );

        setTimeout(() => setSuccess(""), 4000);
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Determine which dashboard layout to wrap with based on user's role
  const userRole = String(profile?.role || localStorage.getItem("role") || "").toLowerCase();
  const LayoutComponent =
    userRole === "coordinator"
      ? CoordinatorDashboardLayout
      : userRole === "admin"
      ? DashboardLayout
      : StudentDashboardLayout;

  const displayRole = normalizeRole(profile?.role || userRole);
  const initials = getInitials(profile?.name);
  const roleClass = userRole || "student";

  return (
    <LayoutComponent>
      <div className="profile-page-container">
        {/* Header */}
        <div className="profile-header-area">
          <h1>My Profile</h1>
          <p>View and manage your personal account information.</p>
        </div>

        {/* Feedback Banners */}
        {error && (
          <div className="profile-feedback-banner error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="profile-feedback-banner success">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="profile-card-main profile-skeleton">
            <div className="profile-skeleton-avatar"></div>
            <div className="profile-skeleton-line" style={{ width: "40%" }}></div>
            <div className="profile-skeleton-line" style={{ width: "65%" }}></div>
            <div className="profile-skeleton-line" style={{ width: "50%" }}></div>
          </div>
        )}

        {/* Main Profile Card */}
        {!loading && profile && (
          <div className="profile-card-main">
            {/* Card Banner */}
            <div className="profile-card-banner"></div>

            <div className="profile-card-content">
              {/* Avatar & Edit Button Row */}
              <div className="profile-avatar-row">
                <div className="profile-large-avatar">{initials}</div>

                {!isEditing && (
                  <button
                    type="button"
                    className="profile-edit-trigger-btn"
                    onClick={handleEditClick}
                  >
                    <Edit3 size={15} />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {/* Identity Header */}
              <div className="profile-identity-section">
                <h2 className="profile-identity-name">
                  <span>{profile.name}</span>
                  <span className={`profile-badge-pill ${roleClass}`}>
                    {displayRole}
                  </span>
                </h2>
                <p className="profile-identity-subtext">{profile.email}</p>
              </div>

              {/* View Mode: Exactly 6 Requested Details */}
              {!isEditing && (
                <div className="profile-details-grid">
                  {/* 1. Full Name */}
                  <div className="profile-field-box">
                    <div className="profile-field-icon">
                      <User size={18} />
                    </div>
                    <div className="profile-field-content">
                      <p className="profile-field-label">Full Name</p>
                      <p className="profile-field-value">{profile.name}</p>
                    </div>
                  </div>

                  {/* 2. Email Address */}
                  <div className="profile-field-box">
                    <div className="profile-field-icon">
                      <Mail size={18} />
                    </div>
                    <div className="profile-field-content">
                      <p className="profile-field-label">Email Address</p>
                      <p className="profile-field-value">{profile.email}</p>
                      <p className="profile-field-hint">Primary Account ID</p>
                    </div>
                  </div>

                  {/* 3. Phone Number */}
                  <div className="profile-field-box">
                    <div className="profile-field-icon">
                      <Phone size={18} />
                    </div>
                    <div className="profile-field-content">
                      <p className="profile-field-label">Phone Number</p>
                      <p className="profile-field-value">
                        {profile.phone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {/* 4. Role */}
                  <div className="profile-field-box">
                    <div className="profile-field-icon">
                      <Shield size={18} />
                    </div>
                    <div className="profile-field-content">
                      <p className="profile-field-label">Role</p>
                      <p className="profile-field-value">{displayRole}</p>
                      <p className="profile-field-hint">System permission level</p>
                    </div>
                  </div>

                  {/* 5. Account Creation Date */}
                  <div className="profile-field-box">
                    <div className="profile-field-icon">
                      <Calendar size={18} />
                    </div>
                    <div className="profile-field-content">
                      <p className="profile-field-label">Member Since</p>
                      <p className="profile-field-value">
                        {formatDate(profile.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Mode: Edit Name and Phone Only */}
              {isEditing && (
                <form onSubmit={handleSubmit} className="profile-edit-form">
                  <div className="profile-form-grid">
                    {/* Editable: Full Name */}
                    <div className="profile-form-group">
                      <label htmlFor="edit-name">
                        Full Name *
                      </label>
                      <input
                        id="edit-name"
                        type="text"
                        className="profile-form-input"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Enter your full name"
                        required
                        autoFocus
                      />
                      <span className="profile-form-hint">
                        Visible on dashboard and event records
                      </span>
                    </div>

                    {/* Editable: Phone Number */}
                    <div className="profile-form-group">
                      <label htmlFor="edit-phone">
                        Phone Number
                      </label>
                      <input
                        id="edit-phone"
                        type="tel"
                        className="profile-form-input"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="10-digit mobile number"
                        maxLength={10}
                      />
                      <span className="profile-form-hint">
                        Used for urgent event communications
                      </span>
                    </div>

                    {/* Non-Editable: Email Address */}
                    <div className="profile-form-group">
                      <label>
                        Email Address
                        <span className="locked-tag">
                          <Lock size={12} /> Non-editable
                        </span>
                      </label>
                      <input
                        type="email"
                        className="profile-form-input disabled"
                        value={profile.email}
                        disabled
                        readOnly
                      />
                      <span className="profile-form-hint">
                        Email cannot be changed
                      </span>
                    </div>

                    {/* Non-Editable: Role */}
                    <div className="profile-form-group">
                      <label>
                        Account Role
                        <span className="locked-tag">
                          <Lock size={12} /> Managed
                        </span>
                      </label>
                      <input
                        type="text"
                        className="profile-form-input disabled"
                        value={displayRole}
                        disabled
                        readOnly
                      />
                      <span className="profile-form-hint">
                        Role is assigned by administration
                      </span>
                    </div>
                  </div>

                  {/* Form Action Buttons */}
                  <div className="profile-form-actions">
                    <button
                      type="button"
                      className="profile-btn secondary"
                      onClick={handleCancelClick}
                      disabled={saving}
                    >
                      <X size={15} />
                      <span>Cancel</span>
                    </button>
                    <button
                      type="submit"
                      className="profile-btn primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 size={16} className="spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </LayoutComponent>
  );
}

