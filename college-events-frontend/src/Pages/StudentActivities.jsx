import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  CalendarCheck,
  UserCheck,
  Trophy,
  Award,
  Clock,
  MapPin,
  Tag,
  ExternalLink,
  RotateCw,
  AlertCircle,
  Inbox,
  Calendar,
  X,
  Printer,
  CheckCircle,
  GraduationCap,
} from "lucide-react";
import StudentDashboardLayout from "../Student-Components/layout/StudentDashboardLayout";
import "../CSS/StudentActivities.css";
import { API_BASE_URL } from "../config/api";

const BASE_URL = API_BASE_URL;

// Format relative time helper
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
  if (diffInDays < 7) return `${diffInDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatFullDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StudentActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCertActivity, setSelectedCertActivity] = useState(null);

  const fetchActivities = useCallback(async () => {
    try {
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in. Please log in to view your activities.");
        setLoading(false);
        return;
      }

      const res = await axios.get(`${BASE_URL}/api/student/activities`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success && Array.isArray(res.data.activities)) {
        setActivities(res.data.activities);
      } else if (Array.isArray(res.data)) {
        setActivities(res.data);
      } else {
        setActivities([]);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError(
        err.response?.data?.message ||
          "Could not load your activities. Please check your connection."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    if (filter === "all") return true;
    if (filter === "registered") return act.type === "event_registered";
    if (filter === "attended") return act.type === "event_attended";
    if (filter === "participated") return act.type === "event_participated";
    if (filter === "certificate") return act.type === "certificate_received";
    return true;
  });

  const countForType = (typeKey) => {
    if (typeKey === "all") return activities.length;
    if (typeKey === "registered")
      return activities.filter((a) => a.type === "event_registered").length;
    if (typeKey === "attended")
      return activities.filter((a) => a.type === "event_attended").length;
    if (typeKey === "participated")
      return activities.filter((a) => a.type === "event_participated").length;
    if (typeKey === "certificate")
      return activities.filter((a) => a.type === "certificate_received").length;
    return 0;
  };

  // Render activity icon and class based on type
  const getActivityMeta = (type) => {
    switch (type) {
      case "event_registered":
        return {
          icon: <CalendarCheck size={18} />,
          className: "registered",
          badgeLabel: "Registered",
        };
      case "event_attended":
        return {
          icon: <UserCheck size={18} />,
          className: "attended",
          badgeLabel: "Attended",
        };
      case "event_participated":
        return {
          icon: <Trophy size={18} />,
          className: "participated",
          badgeLabel: "Participated",
        };
      case "certificate_received":
        return {
          icon: <Award size={18} />,
          className: "certificate",
          badgeLabel: "Certificate",
        };
      default:
        return {
          icon: <Calendar size={18} />,
          className: "registered",
          badgeLabel: "Activity",
        };
    }
  };

  return (
    <StudentDashboardLayout>
      <div className="activities-page">
        {/* Header */}
        <div className="activities-header">
          <div className="activities-header-top">
            <div>
              <h1>My Activities</h1>
              <p>
                Track your journey across event registrations, attendance,
                participation, and earned certificates.
              </p>
            </div>

            <button
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              title="Refresh activities"
            >
              <RotateCw size={15} className={refreshing ? "spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Filter Pills */}
          <div className="activities-filters">
            {[
              { key: "all", label: "All Activities" },
              { key: "registered", label: "Registrations" },
              { key: "attended", label: "Attendance" },
              { key: "participated", label: "Participation" },
              { key: "certificate", label: "Certificates" },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`filter-pill ${filter === tab.key ? "active" : ""}`}
                onClick={() => setFilter(tab.key)}
              >
                <span>{tab.label}</span>
                <span className="filter-count">{countForType(tab.key)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="error-state-card">
            <AlertCircle
              size={32}
              style={{ margin: "0 auto 8px auto", display: "block" }}
            />
            <p>{error}</p>
            <button className="retry-btn" onClick={fetchActivities}>
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="loading-skeleton">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="skeleton-item">
                <div className="skeleton-circle" />
                <div className="skeleton-lines">
                  <div className="skeleton-line short" />
                  <div className="skeleton-line medium" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredActivities.length === 0 && (
          <div className="empty-activities-card">
            <div className="empty-icon-wrap">
              <Inbox size={28} />
            </div>
            <h3>
              {filter === "all"
                ? "No activities yet"
                : `No ${filter} activities found`}
            </h3>
            <p>
              {filter === "all"
                ? "You haven't participated in any campus events yet. Explore upcoming events and register to start building your campus profile!"
                : "Try selecting a different filter above to see other activities."}
            </p>
            {filter === "all" && (
              <Link to="/student/events" className="explore-events-btn">
                <Calendar size={16} />
                Explore Upcoming Events
              </Link>
            )}
          </div>
        )}

        {/* Timeline List */}
        {!loading && !error && filteredActivities.length > 0 && (
          <div className="activities-timeline">
            {filteredActivities.map((activity) => {
              const meta = getActivityMeta(activity.type);
              const eventData = activity.event || {};
              const cert = activity.certificate || {};

              return (
                <div key={activity._id} className="timeline-entry">
                  {/* Icon Circle */}
                  <div className={`timeline-icon-wrap ${meta.className}`}>
                    {meta.icon}
                  </div>

                  {/* Card Content */}
                  <div className="timeline-card">
                    <div className="timeline-card-header">
                      <div className="timeline-title-row">
                        <h4 className="timeline-title">{activity.title}</h4>
                        <span className={`activity-badge ${meta.className}`}>
                          {meta.badgeLabel}
                        </span>
                      </div>

                      <span
                        className="timeline-time"
                        title={formatFullDate(activity.createdAt)}
                      >
                        {formatTimeAgo(activity.createdAt)}
                      </span>
                    </div>

                    <p className="timeline-description">
                      {activity.description}
                    </p>

                    {/* Associated Event Details */}
                    {eventData.title && (
                      <div className="timeline-event-meta">
                        <span className="timeline-event-meta-item">
                          <Tag size={13} />
                          <strong>{eventData.title}</strong>
                        </span>

                        {eventData.category && (
                          <span className="timeline-event-meta-item">
                            Category: {eventData.category}
                          </span>
                        )}

                        {eventData.venue && (
                          <span className="timeline-event-meta-item">
                            <MapPin size={13} />
                            {eventData.venue}
                          </span>
                        )}

                        {eventData.date && (
                          <span className="timeline-event-meta-item">
                            <Clock size={13} />
                            {new Date(eventData.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Certificate Box */}
                    {activity.type === "certificate_received" && (
                      <div className="certificate-box">
                        <div className="certificate-info">
                          <Award size={22} color="#d97706" />
                          <div>
                            <p className="certificate-title-text">
                              {cert.title || "Certificate of Participation"}
                            </p>
                            <p className="certificate-date">
                              Issued on{" "}
                              {cert.issueDate
                                ? new Date(cert.issueDate).toLocaleDateString()
                                : new Date(
                                    activity.createdAt
                                  ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="certificate-actions-row">
                          <button
                            type="button"
                            className="certificate-btn"
                            onClick={() => setSelectedCertActivity(activity)}
                          >
                            <Award size={13} />
                            View Certificate
                          </button>

                          {cert.certificateUrl &&
                            cert.certificateUrl.startsWith("http") && (
                              <a
                                href={cert.certificateUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="certificate-btn"
                                style={{ backgroundColor: "#0284c7" }}
                              >
                                <ExternalLink size={13} />
                                File Link
                              </a>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Certificate View Modal */}
        {selectedCertActivity && (
          <div
            className="cert-modal-overlay"
            onClick={() => setSelectedCertActivity(null)}
          >
            <div
              className="cert-modal-box"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cert-modal-header">
                <h3>Certificate Preview</h3>
                <button
                  className="cert-modal-close-btn"
                  onClick={() => setSelectedCertActivity(null)}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Printable Certificate Document */}
              <div className="cert-document">
                <div className="cert-doc-logo">
                  <GraduationCap size={22} />
                  <span>CampusHub</span>
                </div>

                <div className="cert-doc-subtitle">
                  College Event Management
                </div>
                <h2 className="cert-doc-main-title">
                  CERTIFICATE OF PARTICIPATION
                </h2>

                <p className="cert-doc-prose">This is to proudly certify that</p>
                <div className="cert-doc-recipient">
                  {selectedCertActivity.student?.name || "Student"}
                </div>
                <div className="cert-doc-course">
                  {selectedCertActivity.student?.course || "Student"}
                  {selectedCertActivity.student?.college
                    ? ` • ${selectedCertActivity.student.college}`
                    : ""}
                </div>

                <p className="cert-doc-prose">
                  has actively participated in and successfully completed
                </p>
                <div className="cert-doc-event-title">
                  "{selectedCertActivity.event?.title || selectedCertActivity.title}"
                </div>

                {selectedCertActivity.event?.venue && (
                  <div className="cert-doc-meta">
                    Held at {selectedCertActivity.event.venue} on{" "}
                    {new Date(
                      selectedCertActivity.event?.date ||
                        selectedCertActivity.createdAt
                    ).toLocaleDateString()}
                  </div>
                )}

                <div className="cert-doc-footer">
                  <div className="cert-footer-col">
                    <small>Certificate ID</small>
                    <strong>
                      CH-
                      {(selectedCertActivity._id || "VERIFIED")
                        .slice(-8)
                        .toUpperCase()}
                    </strong>
                  </div>

                  <div className="cert-verified-badge">
                    <CheckCircle size={14} />
                    <span>Official & Verified</span>
                  </div>

                  <div className="cert-footer-col right">
                    <small>Issued Date</small>
                    <strong>
                      {selectedCertActivity.certificate?.issueDate
                        ? new Date(
                            selectedCertActivity.certificate.issueDate
                          ).toLocaleDateString()
                        : new Date(
                            selectedCertActivity.createdAt
                          ).toLocaleDateString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="cert-modal-actions">
                <button
                  type="button"
                  className="cert-action-btn secondary"
                  onClick={() => window.print()}
                >
                  <Printer size={15} />
                  Print / Save PDF
                </button>

                {selectedCertActivity.certificate?.certificateUrl &&
                  selectedCertActivity.certificate.certificateUrl.startsWith(
                    "http"
                  ) && (
                    <a
                      href={selectedCertActivity.certificate.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cert-action-btn primary"
                    >
                      <ExternalLink size={15} />
                      Open Original
                    </a>
                  )}

                <button
                  type="button"
                  className="cert-action-btn primary"
                  onClick={() => setSelectedCertActivity(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentDashboardLayout>
  );
}
