
import { useCallback, useEffect, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../CSS/NotificationBell.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function NotificationBell({ enableNavigation = false }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Unable to load notifications.");
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      setError(err.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (item) => {
    if (item.isRead) return;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${item._id}/read`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Could not mark notification as read.");
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === item._id
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      setError(err.message);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/api/notifications/read-all`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Could not update notifications.");
      }

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNotificationClick = async (item) => {
    await markAsRead(item);

    if (!enableNavigation) return;

    if (item.type === "certificate_generated") {
      navigate("/student/activities");
      return;
    }

    if (item.relatedEvent) {
      navigate("/student/events");
    }
  };

  const formatTime = (date) => {
    const timestamp = new Date(date).getTime();
    if (!Number.isFinite(timestamp)) return "";

    const seconds = Math.max(
      0,
      Math.floor((Date.now() - timestamp) / 1000)
    );

    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="notification-wrapper">
      <button
        type="button"
        className="notification-bell"
        aria-label={`Notifications: ${unreadCount} unread`}
        aria-expanded={open}
        onClick={() => {
          const nextOpen = !open;
          setOpen(nextOpen);
          if (nextOpen) fetchNotifications();
        }}
      >
        <Bell size={25} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="notification-backdrop"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />

          <section className="notification-panel">
            <div className="notification-header">
              <h3>Notifications</h3>
              <button
                type="button"
                title="Mark all as read"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck size={17} />
              </button>
            </div>

            {error && <p className="notification-error">{error}</p>}

            {loading && notifications.length === 0 ? (
              <p className="notification-empty">Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <p className="notification-empty">
                You're all caught up!
              </p>
            ) : (
              <div className="notification-list">
                {notifications.map((item) => (
                  <button
                    type="button"
                    key={item._id}
                    className={`notification-item ${
                      item.isRead ? "" : "unread"
                    }`}
                    onClick={() => handleNotificationClick(item)}
                  >
                    <span className="notification-item-icon">
                      {item.isRead ? <Check size={17} /> : <Bell size={17} />}
                    </span>

                    <span className="notification-item-content">
                      <strong>{item.title}</strong>
                      <span className="notification-message">
                        {item.message}
                      </span>
                      <span className="notification-time">
                        {formatTime(item.createdAt)}
                      </span>
                    </span>

                    {!item.isRead && (
                      <span className="notification-unread-dot" />
                    )}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              className="notification-footer"
              onClick={fetchNotifications}
            >
              Refresh notifications
            </button>
          </section>
        </>
      )}
    </div>
  );
}
