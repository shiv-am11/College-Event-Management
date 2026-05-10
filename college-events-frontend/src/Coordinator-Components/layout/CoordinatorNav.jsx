import { useState } from "react";
import {
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  UserStar,
} from "lucide-react";
import "./CoordinatorNav.css";

export function CoordinatorNav() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    { id: 1, title: "New event pending approval", time: "2 min ago", unread: true },
    { id: 2, title: "Tech Fest registration closed", time: "1 hour ago", unread: true },
    { id: 3, title: "New user registered", time: "3 hours ago", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="Cordi-top-navbar">
      <div className="Coordi-Admin-hero">
      </div>
      <div className="Coordi-navbar-actions">
        <div className="Coordi-dropdown-wrapper">
          <button
            className="Coordi-icon-btn"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
          >
            <Bell size={27} />
            {unreadCount > 0 && (
              <span className="Coordi-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="dropdown notifications">
              <h4>Notifications</h4>

              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`notification-item ${n.unread ? "unread" : ""}`}
                >
                  <p>{n.title}</p>
                  <span>{n.time}</span>
                </div>
              ))}

              <button className="view-all">View all</button>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="dropdown-wrapper">
          <button
            className="profile-btn"
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
          >
            <div className="avatar">
             <UserStar size={24} />
            </div>
            <div className="profile-info">
              <p>Student User</p>
              <span>Super Admin</span>
            </div>
            <ChevronDown size={16} />
          </button>

          {showProfile && (
            <div className="dropdown profile">
              <button><User size={16} /> My Profile</button>
              <button><Settings size={16} /> Settings</button>
              <hr />
              <button className="logout"><LogOut size={16} /> Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
