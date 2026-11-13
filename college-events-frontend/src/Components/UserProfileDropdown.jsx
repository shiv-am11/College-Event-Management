import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import SettingsModal from "./SettingsModal";
import "../CSS/UserProfileDropdown.css";
import { API_BASE_URL } from "../config/api";

const BASE_URL = API_BASE_URL;

// Helper to compute initials from full name
function getInitials(name = "") {
  if (!name || typeof name !== "string") return "U";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Role normalization for clean display
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

// Parse user role from JWT token as backup
function getRoleFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "";
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized));
    return decoded.role || "";
  } catch {
    return "";
  }
}

function getProfilePath(role) {
  const profileRoutes = {
    student: "/student/profile",
    coordinator: "/coordinator/profile",
    admin: "/admin/profile",
    faculty: "/faculty/profile",
  };

  return profileRoutes[String(role || "").toLowerCase().trim()] || "/Login";
}

export default function UserProfileDropdown() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Initialize from localStorage for instantaneous rendering
  const [userData, setUserData] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      const storedRole = localStorage.getItem("role") || getRoleFromToken();
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          name: parsed.name || "User",
          email: parsed.email || "",
          role: parsed.role || storedRole || "student",
        };
      }
      return {
        name: "User",
        email: "",
        role: storedRole || "student",
      };
    } catch {
      return { name: "User", email: "", role: "student" };
    }
  });

  // Fetch verified profile from GET /api/auth/me
  const fetchCurrentProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success && res.data.user) {
        const freshUser = res.data.user;
        setUserData({
          name: freshUser.name || "User",
          email: freshUser.email || "",
          role: freshUser.role || "student",
        });

        localStorage.setItem(
          "user",
          JSON.stringify({
            id: freshUser._id || freshUser.id,
            name: freshUser.name,
            email: freshUser.email,
            role: freshUser.role,
            phone: freshUser.phone,
          })
        );
        localStorage.setItem("role", freshUser.role);
      }
    } catch (err) {
      // If token expired or unauthorized, clean fallback
      if (err.response?.status === 401) {
        console.warn("Session expired or token invalid.");
      }
    }
  }, []);

  useEffect(() => {
    fetchCurrentProfile();

    // Listen for custom "userProfileUpdated" event dispatched when user edits profile
    const handleProfileUpdate = (event) => {
      const updated = event.detail;
      if (updated) {
        setUserData((prev) => ({
          ...prev,
          name: updated.name || prev.name,
          email: updated.email || prev.email,
          role: updated.role || prev.role,
        }));
      } else {
        fetchCurrentProfile();
      }
    };

    window.addEventListener("userProfileUpdated", handleProfileUpdate);
    return () => window.removeEventListener("userProfileUpdated", handleProfileUpdate);
  }, [fetchCurrentProfile]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setShowLogoutConfirm(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleProfileClick = () => {
    setIsOpen(false);
    navigate(getProfilePath(getRoleFromToken() || userData.role));
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    setShowSettingsModal(true);
  };

  const handleLogoutInitiate = () => {
    setIsOpen(false);
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setShowLogoutConfirm(false);
    navigate("/Login");
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const displayRole = normalizeRole(userData.role);
  const initials = getInitials(userData.name);
  const roleClass = String(userData.role || "student").toLowerCase();

  return (
    <div className="user-profile-dropdown-wrapper" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className={`user-profile-trigger-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={`${userData.name} (${displayRole})`}
      >
        <div className="user-profile-avatar">{initials}</div>

        <div className="user-profile-meta">
          <span className="user-profile-name">{userData.name}</span>
          <span className={`user-role-badge ${roleClass}`}>{displayRole}</span>
        </div>

        <ChevronDown
          size={16}
          className={`user-profile-chevron ${isOpen ? "rotated" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="user-profile-dropdown-menu" role="menu">
          {/* Summary Header */}
          <div className="dropdown-header-summary">
            <div className="dropdown-header-avatar">{initials}</div>
            <div className="dropdown-header-info">
              <p className="name">{userData.name}</p>
              <p className="email">{userData.email || displayRole}</p>
            </div>
          </div>

          <div className="dropdown-items-group">
            <button
              type="button"
              className="dropdown-item-btn"
              onClick={handleProfileClick}
              role="menuitem"
            >
              <User size={16} />
              <span>My Profile</span>
            </button>

            <button
              type="button"
              className="dropdown-item-btn"
              onClick={handleSettingsClick}
              role="menuitem"
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>

            <hr className="dropdown-menu-divider" />

            <button
              type="button"
              className="dropdown-item-btn danger"
              onClick={handleLogoutInitiate}
              role="menuitem"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="logout-modal-backdrop" onClick={handleLogoutCancel}>
          <div
            className="logout-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="logout-modal-icon-wrap">
              <AlertTriangle size={26} />
            </div>

            <h3>Confirm Logout</h3>
            <p>
              Are you sure you want to log out of CampusHub? You will need to sign in
              again to access your account.
            </p>

            <div className="logout-modal-actions">
              <button
                type="button"
                className="modal-btn cancel"
                onClick={handleLogoutCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn danger"
                onClick={handleLogoutConfirm}
              >
                <LogOut size={15} />
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
}

