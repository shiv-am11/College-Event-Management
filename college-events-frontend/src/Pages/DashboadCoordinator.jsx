import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CoordinatorDashboardLayout from '../Coordinator-Components/layout/CoordinatorDashLayout';
import CoordinatorStatCard from '../Coordinator-Components/CoordinatorStatCard';
import { Award, Calendar, Clock, TrendingUp, User, Users } from 'lucide-react';
import CoordiRecentEvent from '../Coordinator-Components/CoordiRecentEvent';
import StudentRecentActivity from '../Student-Components/Student-Components/StudentRecentActivity';
import CoordinatorQuickActions from '../Coordinator-Components/CoordinatorQuickAction';

const DashboadCoordinator = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalStudents: 0,
    totalRegistrations: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/coordinator/dashboard-stats",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  return (
    <CoordinatorDashboardLayout>
      <h1 style={{ marginBottom: "10px" }}>
        Welcome back, Coordinator!
      </h1>

      <p style={{ marginBottom: "7px" }}>
        Here's what's happening with your Department.
      </p>

      <div className="stats-grid" style={{ marginBottom: "10px" }}>
        <CoordinatorStatCard
          title="Total Events"
          value={stats.totalEvents}
          icon={<Calendar size={20} />}
        />

        <CoordinatorStatCard
          title="Upcoming Events"
          value={stats.upcomingEvents}
          icon={<Clock size={20} />}
        />

        <CoordinatorStatCard
          title="Department Students"
          value={stats.totalStudents}
          icon={<Users size={20} />}
        />

        <CoordinatorStatCard
          title="Total Registration"
          value={stats.totalRegistrations}
          icon={<TrendingUp size={20} />}
        />
      </div>

      <div className="dashboard-grid">
        <CoordiRecentEvent />
        <CoordinatorQuickActions/>
      </div>
    </CoordinatorDashboardLayout>
  );
};

export default DashboadCoordinator;