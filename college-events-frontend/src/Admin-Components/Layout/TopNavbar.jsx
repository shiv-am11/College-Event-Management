import { useState } from "react";
import { Bell } from "lucide-react";
import UserProfileDropdown from "../../Components/UserProfileDropdown";
import "./TopNavbar.css";

export function TopNavbar() {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: "New event pending approval", time: "2 min ago", unread: true },
    { id: 2, title: "Tech Fest registration closed", time: "1 hour ago", unread: true },
    { id: 3, title: "New user registered", time: "3 hours ago", unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="top-navbar">
      <div className="Admin-hero"></div>
      <div className="navbar-actions">
        {/* Notifications */}
        <div className="dropdown-wrapper">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell size={24} />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="dropdown notifications">
              <h4>Notifications</h4>

              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notification-item ${n.unread ? "unread" : ""}`}
                >
                  <p>{n.title}</p>
                  <span>{n.time}</span>
                </div>
              ))}

              <button type="button" className="view-all">
                View all
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Role-Based Profile Dropdown */}
        <UserProfileDropdown />
      </div>
    </header>
  );
}

export default TopNavbar;
