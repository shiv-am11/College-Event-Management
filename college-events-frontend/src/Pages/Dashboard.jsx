import { useEffect, useState } from "react";
import axios from "axios";
import "../CSS/Admin-Dashboard.css";
import { Calendar, Users, CalendarCheck, ClipboardList } from "lucide-react";

import DashboardLayout from "../Admin-Components/Layout/DashboardLayout";
import StatCard from "../Admin-Components/StatCard";
import RecentEvents from "../Admin-Components/RecentEvents";
import QuickActions from "../Admin-Components/QuickActions";
import UpcomingEvents from "../Admin-Components/UpcomingEvents";

export default function Dashboard() {
  const [admin, setAdmin] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statsData, setStatsData] = useState({
  totalEvents: 0,
  upcomingEvents: 0,
  totalStudents: 0,
  totalRegistrations: 0,
});

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please login again.");
          return;
        }

        const res = await axios.get(
          "http://localhost:3000/api/admin/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAdmin(res.data.user);
      } catch (err) {
        setError("Unauthorized or session expired");
      }
    };

    fetchAdminDashboard();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:3000/api/admin/events", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setEvents(data.events);
        }
      } catch (err) {
        console.error("Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);
  useEffect(() => {
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3000/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setStatsData(data);
      }
    } catch (err) {
      console.error("Stats fetch failed");
    }
  };

  fetchStats();
}, []);

  if (loading) return <h2>Loading Admin Dashboard...</h2>;
  if (error) return <h2>{error}</h2>;

  const stats = [
  {
    title: "Total Events",
    value: statsData.totalEvents,
    icon: Calendar,
  },
  {
    title: "Upcoming Events",
    value: statsData.upcomingEvents,
    icon: CalendarCheck,
  },
  {
    title: "Total Students",
    value: statsData.totalStudents,
    icon: Users,
  },
  {
    title: "Registrations",
    value: statsData.totalRegistrations,
    icon: ClipboardList,
  },
];
console.log("STATS:", statsData);
  return (
    <DashboardLayout>
      <div className="dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening with your events.</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {stats.map((s) => (
            <StatCard
              key={s.title}
              title={s.title}
              value={s.value}
              icon={s.icon}
            />
          ))}
        </div>

        <div className="dashboard-grid">
          <div className="left">
            <RecentEvents events={events} />
          </div>

          <div className="right">
            <QuickActions />
            <UpcomingEvents events={events} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
