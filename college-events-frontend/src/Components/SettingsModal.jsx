import { useState, useEffect } from "react";
import axios from "axios";
import {
  X,
  Lock,
  Bell,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import "../CSS/SettingsModal.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function SettingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("password");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Notification preference
  const [emailNotifications, setEmailNotifications] = useState(() => {
    return localStorage.getItem("campushub_email_notifications") !== "false";
  });

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${BASE_URL}/api/auth/change-password`,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success) {
        setSuccess("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update password. Please check your current password."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleNotifications = (e) => {
    const checked = e.target.checked;
    setEmailNotifications(checked);
    localStorage.setItem("campushub_email_notifications", String(checked));
    setSuccess("Notification preferences saved.");
    setTimeout(() => setSuccess(""), 2500);
  };

  return (
    <div className="settings-modal-backdrop" onClick={onClose}>
      <div className="settings-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-modal-header">
          <h3>Settings</h3>
          <button
            type="button"
            className="settings-modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="settings-tabs-row">
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === "password" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("password");
              setError("");
              setSuccess("");
            }}
          >
            <Lock size={15} />
            Change Password
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${activeTab === "preferences" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("preferences");
              setError("");
              setSuccess("");
            }}
          >
            <Bell size={15} />
            Preferences
          </button>
        </div>

        {/* Body */}
        <div className="settings-modal-body">
          {error && (
            <div className="settings-alert error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="settings-alert success">
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          {activeTab === "password" && (
            <form onSubmit={handlePasswordSubmit}>
              <div className="settings-form-group">
                <label>Current Password</label>
                <div className="settings-input-wrapper">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    className="settings-input"
                    placeholder="Enter your current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="settings-password-toggle"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="settings-form-group">
                <label>New Password</label>
                <div className="settings-input-wrapper">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="settings-input"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="settings-password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="settings-form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  className="settings-input"
                  placeholder="Re-type your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="settings-modal-actions">
                <button
                  type="button"
                  className="modal-btn cancel"
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-btn danger"
                  style={{ background: "#4f46e5" }}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 size={15} className="spin" />
                      Saving...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === "preferences" && (
            <div>
              <div className="settings-toggle-row">
                <div className="settings-toggle-info">
                  <strong>Event & System Emails</strong>
                  <span>Receive email notifications for registrations & updates</span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={handleToggleNotifications}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="settings-modal-actions" style={{ marginTop: "24px" }}>
                <button
                  type="button"
                  className="modal-btn cancel"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

