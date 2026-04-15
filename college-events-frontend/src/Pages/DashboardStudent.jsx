import { useEffect, useState } from "react";
import StudentDashboardLayout from "../Student-Components/layout/StudentDashboardLayout";
import StudentRecentActivity from "../Student-Components/Student-Components/StudentRecentActivity";
import StudentStatCard from "../Student-Components/Student-Components/StudentStatCard";
import StudentUpcomingEvents from "../Student-Components/Student-Components/StudentUpcomingEvents";
import { Calendar, Clock, Award, TrendingUp } from "lucide-react";

const DashboardStudent = () => {

  const [stats, setStats] = useState({
    registeredCount: 0,
    upcomingCount: 0,
    certificates: 0,
    score: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:3000/api/student/dashboard-stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setStats(data);

      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);


  return (
    <StudentDashboardLayout> 
      <h1 style={{ marginBottom: "10px" }}>
        Welcome back, User! 👋
      </h1>

      <p style={{ marginBottom: "7px" }}>
        Here's what's happening with your campus activities.
      </p>

      <div className="stats-grid" style={{ marginBottom: "10px" }}>
        <StudentStatCard
          title="Registered Events"
          value={stats.registeredCount}
          subtext="+3 this month"
          icon={<Calendar size={28} />}
        />

        <StudentStatCard
          title="Upcoming Events"
          value={stats.upcomingCount}
          subtext="Next in 2 days"
          icon={<Clock size={28} />}
        />

        <StudentStatCard
          title="Certificates Earned"
          value={stats.certificates}
          subtext="+2 this semester"
          icon={<Award size={28} />}
        />

        <StudentStatCard
          title="Participation Score"
          value={`${stats.score}%`}
          subtext="+12% from last month"
          icon={<TrendingUp size={28} />}
        />
      </div>

      <div className="dashboard-grid">
        <StudentUpcomingEvents />
        <StudentRecentActivity />
      </div>
    </StudentDashboardLayout>
  );
};

export default DashboardStudent;
