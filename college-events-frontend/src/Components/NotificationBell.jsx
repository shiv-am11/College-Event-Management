import { useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationList from "./NotificationList";
import { useNotifications } from "./useNotifications";
import { getNotificationDestination } from "./notificationNavigation";
import "../CSS/NotificationBell.css";

export default function NotificationBell({ enableNavigation = false, role }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const notificationState = useNotifications();

  const handleNotificationClick = async (notification) => {
    const marked = await notificationState.markAsRead(notification);
    if (!marked || !enableNavigation) return;

    const destination = getNotificationDestination(notification, role);
    if (destination) navigate(destination);
  };

  return (
    <div className="notification-wrapper">
      <button
        type="button"
        className="notification-bell"
        aria-label={`Notifications: ${notificationState.unreadCount} unread`}
        aria-expanded={open}
        onClick={() => {
          const nextOpen = !open;
          setOpen(nextOpen);
          if (nextOpen) notificationState.refresh();
        }}
      >
        <Bell size={25} />
        {notificationState.unreadCount > 0 && (
          <span className="notification-badge">
            {notificationState.unreadCount > 99 ? "99+" : notificationState.unreadCount}
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
            <NotificationList
              {...notificationState}
              onMarkAsRead={handleNotificationClick}
              onMarkAllAsRead={notificationState.markAllAsRead}
              onRefresh={notificationState.refresh}
              onViewAll={() => {
                const page = role ? `/${role}/notifications` : null;
                if (page) navigate(page);
                setOpen(false);
              }}
            />
          </section>
        </>
      )}
    </div>
  );
}
