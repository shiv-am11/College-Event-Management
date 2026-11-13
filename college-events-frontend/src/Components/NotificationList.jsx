import { Bell, Check, CheckCheck, RefreshCw } from "lucide-react";

function formatTime(date) {
  const timestamp = new Date(date).getTime();
  if (!Number.isFinite(timestamp)) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(date).toLocaleDateString();
}

export default function NotificationList({
  notifications,
  unreadCount,
  loading,
  error,
  onMarkAsRead,
  onMarkAllAsRead,
  onRefresh,
  onLoadMore,
  onViewAll,
  hasMore = false,
  fullPage = false,
}) {
  return (
    <>
      <div className="notification-header">
        <h3>Notifications</h3>
        <div className="notification-header-actions">
          {!fullPage && (
            <button
              type="button"
              title="Refresh notifications"
              aria-label="Refresh notifications"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw size={17} className={loading ? "notification-refreshing" : ""} />
            </button>
          )}
          <button
            type="button"
            title="Mark all as read"
            aria-label="Mark all as read"
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck size={17} />
          </button>
        </div>
      </div>

      {error && <p className="notification-error">{error}</p>}
      {loading && notifications.length === 0 ? (
        <p className="notification-empty">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p className="notification-empty">You're all caught up!</p>
      ) : (
        <div className="notification-list">
          {notifications.map((item) => (
            <button
              type="button"
              key={item._id}
              className={`notification-item ${item.isRead ? "" : "unread"}`}
              onClick={() => onMarkAsRead(item)}
            >
              <span className="notification-item-icon">
                {item.isRead ? <Check size={17} /> : <Bell size={17} />}
              </span>
              <span className="notification-item-content">
                <strong>{item.title}</strong>
                <span className="notification-message">{item.message}</span>
                <span className="notification-time">{formatTime(item.createdAt)}</span>
              </span>
              {!item.isRead && <span className="notification-unread-dot" />}
            </button>
          ))}
        </div>
      )}

      {hasMore && (
        <button type="button" className="notification-footer" onClick={onLoadMore}>
          {loading ? "Loading..." : "Load more"}
        </button>
      )}
      {!fullPage && (
        <>
          <button type="button" className="notification-footer" onClick={onViewAll}>
            View all notifications
          </button>
        </>
      )}
    </>
  );
}

