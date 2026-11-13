import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./StudentRecentActivity.css";
import { API_BASE_URL } from "../../config/api";

const BASE_URL = API_BASE_URL;

function formatTimeAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getDotClass(type) {
  switch (type) {
    case "event_registered":
      return "dot registered";
    case "event_attended":
      return "dot attended";
    case "event_participated":
      return "dot participated";
    case "certificate_received":
      return "dot certificate";
    default:
      return "dot";
  }
}

function getActionLabel(type) {
  switch (type) {
    case "event_registered":
      return "Registered for";
    case "event_attended":
      return "Attended";
    case "event_participated":
      return "Participated in";
    case "certificate_received":
      return "Certificate received for";
    default:
      return "Activity in";
  }
}

const StudentRecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${BASE_URL}/api/student/activities?limit=4`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data?.success && Array.isArray(data.activities)) {
          setActivities(data.activities);
        } else if (Array.isArray(data)) {
          setActivities(data);
        } else {
          setActivities([]);
        }
      } catch (err) {
        console.error("Error fetching recent activities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();
  }, []);

  return (
    <div className="activity-card">
      <div className="activity-card-header">
        <h3>Recent Activity</h3>
        <Link to="/student/activities" className="view-all-link">
          View All
        </Link>
      </div>

      {loading ? (
        <div className="activity-loading">Loading recent activities...</div>
      ) : activities.length === 0 ? (
        <div className="activity-empty">
          No recent activities yet. Register for events to get started!
        </div>
      ) : (
        <div className="timeline">
          {activities.map((a) => {
            const eventName =
              a.event?.title || a.title || "Campus Event";
            const actionText = getActionLabel(a.type);

            return (
              <div key={a._id} className="timeline-item">
                <div className={getDotClass(a.type)} />
                <div className="content">
                  <p>
                    {actionText}{" "}
                    <span className="event-name">{eventName}</span>
                  </p>
                  <small>{formatTimeAgo(a.createdAt)}</small>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentRecentActivity;
