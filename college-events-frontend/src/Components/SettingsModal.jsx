import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
import { API_BASE_URL } from "../config/api";

const BASE_URL = API_BASE_URL;

export default function SettingsModal({ isOpen, onClose, passwordOnly = false }) {
  const [activeTab, setActiveTab] = useState("password");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Notification preference
  const [emailNotifications, setEmailNotifications] = useState(() => {
    return localStorage.getItem("campushub_email_notifications") !== "false";
  });

  const handleClose = useCallback(() => {
    if (saving) return;
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    setFieldErrors({});
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  }, [onClose, saving]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const nextFieldErrors = {};

    if (!currentPassword) {
      nextFieldErrors.currentPassword = "Current password is required.";
    }

    if (!newPassword) {
      nextFieldErrors.newPassword = "New password is required.";
    } else if (newPassword.length < 6) {
      nextFieldErrors.newPassword = "New password must be at least 6 characters long.";
    } else if (newPassword === currentPassword) {
      nextFieldErrors.newPassword = "New password must differ from current password.";
    }

    if (!confirmPassword) {
      nextFieldErrors.confirmPassword = "Please confirm your new password.";
    } else if (newPassword !== confirmPassword) {
      nextFieldErrors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) {
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
        setFieldErrors({});
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

  return createPortal(
    <div className="settings-modal-backdrop" onClick={handleClose}>
      <div
        className="settings-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-modal-title"
      >
        {/* Header */}
        <div className="settings-modal-header">
          <h3 id="change-password-modal-title">
            {passwordOnly ? "Change Password" : "Settings"}
          </h3>
          <button
            type="button"
            className="settings-modal-close-btn"
            onClick={handleClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        {!passwordOnly && <div className="settings-tabs-row">
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
        </div>}

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
                <label htmlFor="current-password">Current Password</label>
                <div className="settings-input-wrapper">
                  <input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    className="settings-input"
                    placeholder="Enter your current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    aria-invalid={Boolean(fieldErrors.currentPassword)}
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
                {fieldErrors.currentPassword && (
                  <span className="settings-field-error">{fieldErrors.currentPassword}</span>
                )}
              </div>

              <div className="settings-form-group">
                <label htmlFor="new-password">New Password</label>
                <div className="settings-input-wrapper">
                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    className="settings-input"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    aria-invalid={Boolean(fieldErrors.newPassword)}
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
                {fieldErrors.newPassword && (
                  <span className="settings-field-error">{fieldErrors.newPassword}</span>
                )}
              </div>

              <div className="settings-form-group">
                <label htmlFor="confirm-password">Confirm New Password</label>
                <div className="settings-input-wrapper">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    className="settings-input"
                    placeholder="Re-type your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  />
                  <button
                    type="button"
                    className="settings-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <span className="settings-field-error">{fieldErrors.confirmPassword}</span>
                )}
              </div>

              <div className="settings-modal-actions">
                <button
                  type="button"
                  className="modal-btn cancel"
                  onClick={handleClose}
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
                  onClick={handleClose}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

