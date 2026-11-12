import { useCallback, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function useNotifications({ limit = 50 } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(async (page = 1, append = false) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please sign in to load notifications.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await fetch(
        `${API_URL}/api/notifications?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error("Unable to load notifications.");

      const data = await response.json();
      setNotifications((previous) =>
        append
          ? [...previous, ...(data.notifications || [])]
          : data.notifications || []
      );
      setUnreadCount(Number(data.unreadCount) || 0);
      setPagination(data.pagination || null);
    } catch (requestError) {
      setError(requestError.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const refresh = useCallback(() => fetchNotifications(1, false), [fetchNotifications]);

  const loadMore = useCallback(() => {
    if (!pagination?.hasMore || loading) return;
    fetchNotifications(pagination.page + 1, true);
  }, [fetchNotifications, loading, pagination]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const markAsRead = useCallback(async (item) => {
    if (item.isRead) return true;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/api/notifications/${item._id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Could not mark notification as read.");

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === item._id
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount((count) => Math.max(0, count - 1));
      return true;
    } catch (requestError) {
      setError(requestError.message || "Could not mark notification as read.");
      return false;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Could not update notifications.");

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, isRead: true }))
      );
      setUnreadCount(0);
      return true;
    } catch (requestError) {
      setError(requestError.message || "Could not update notifications.");
      return false;
    }
  }, []);

  return {
    notifications,
    unreadCount,
    pagination,
    loading,
    error,
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
  };
}

