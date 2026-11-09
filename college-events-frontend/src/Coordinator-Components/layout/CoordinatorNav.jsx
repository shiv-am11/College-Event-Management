import { useState } from "react";
import {
  ChevronDown,
  User,
  Settings,
  LogOut,
  UserStar,
} from "lucide-react";

import NotificationBell from "../../Components/NotificationBell";
import "./CoordinatorNav.css";

export function CoordinatorNav() {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="Cordi-top-navbar">
      <div className="Coordi-Admin-hero"></div>

      <div className="Coordi-navbar-actions">
        {/* Dynamic Notifications */}
        <NotificationBell />

        {/* Profile */}
        <div className="dropdown-wrapper">
          <button
            type="button"
            className="profile-btn"
            onClick={() => setShowProfile((previous) => !previous)}
            aria-expanded={showProfile}
          >
            <div className="avatar">
              <UserStar size={24} />
            </div>

            <div className="profile-info">
              <p>Coordinator</p>
              <span>Course Coordinator</span>
            </div>

            <ChevronDown size={16} />
          </button>

          {showProfile && (
            <div className="dropdown profile">
              <button type="button">
                <User size={16} />
                My Profile
              </button>

              <button type="button">
                <Settings size={16} />
                Settings
              </button>

              <hr />

              <button
                type="button"
                className="logout"
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/Login";
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
