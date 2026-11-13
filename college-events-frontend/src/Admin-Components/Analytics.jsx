import { createElement, useEffect, useState } from "react";
import axios from "axios";
import { BarChart3, Calendar, ClipboardList, UserRound } from "lucide-react";
import DashboardLayout from "../Admin-Components/Layout/DashboardLayout";
import "../CSS/Analytics.css";
import { API_BASE_URL } from "../config/api";

const BASE_URL = API_BASE_URL;

const initialAnalytics = {
  stats: {
    totalEvents: 0,
    totalStudents: 0,
    totalRegistrations: 0,
    approvedEvents: 0,
    pendingEvents: 0,
    rejectedEvents: 0,
  },
  eventsByCategory: [],
  studentsByCourse: [],
};

function DataBarChart({ items, labelKey, title, emptyMessage }) {
  const maximum = Math.max(...items.map((item) => item.count), 0);

  return (
    <section className="analytics-chart-card">
      <div className="analytics-chart-heading">
        <BarChart3 size={20} />
        <h2>{title}</h2>
      </div>
      {items.length === 0 ? (
        <p className="analytics-empty">{emptyMessage}</p>
      ) : (
        <div className="analytics-bars" role="list" aria-label={title}>
          {items.map((item) => {
            const label = item[labelKey];
            const width = maximum ? Math.max((item.count / maximum) * 100, 4) : 0;

            return (
              <div className="analytics-bar-row" key={label} role="listitem">
                <div className="analytics-bar-label">
                  <span>{label}</span>
                  <strong>{item.count}</strong>
                </div>
                <div className="analytics-bar-track">
                  <div className="analytics-bar-fill" style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BASE_URL}/api/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.data?.success) {
          throw new Error(response.data?.message || "Unable to load analytics.");
        }

        setAnalytics({
          stats: { ...initialAnalytics.stats, ...response.data.stats },
          eventsByCategory: response.data.eventsByCategory || [],
          studentsByCourse: response.data.studentsByCourse || [],
        });
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            "Unable to load analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const cards = [
    { label: "Total Events", value: analytics.stats.totalEvents, icon: Calendar },
    { label: "Approved Events", value: analytics.stats.approvedEvents, icon: Calendar },
    { label: "Pending Events", value: analytics.stats.pendingEvents, icon: Calendar },
    { label: "Rejected Events", value: analytics.stats.rejectedEvents, icon: Calendar },
    { label: "Total Students", value: analytics.stats.totalStudents, icon: UserRound },
    { label: "Registrations", value: analytics.stats.totalRegistrations, icon: ClipboardList },
  ];

  return (
    <DashboardLayout>
      <div className="Admin-analytics">
        <div className="analytics-page-header">
          <div>
            <h1>Analytics</h1>
            <p className="Admin-subtitle">Live event and student data overview</p>
          </div>
        </div>

        {loading && <p className="analytics-status">Loading analytics...</p>}
        {error && <p className="analytics-status analytics-error">{error}</p>}

        {!loading && !error && (
          <>
            <div className="Admin-stats-row">
              {cards.map((card) => (
                <div className="analytics-stat" key={card.label}>
                  <div>
                    <strong>{card.value}</strong>
                    <span>{card.label}</span>
                  </div>
                  {createElement(card.icon, { size: 22 })}
                </div>
              ))}
            </div>

            <div className="analytics-charts">
              <DataBarChart
                items={analytics.eventsByCategory}
                labelKey="category"
                title="Events by Category"
                emptyMessage="No event category data is available."
              />
              <DataBarChart
                items={analytics.studentsByCourse}
                labelKey="course"
                title="Students by Course"
                emptyMessage="No student course data is available."
              />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
