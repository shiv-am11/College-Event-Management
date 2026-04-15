import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Award,
  TrendingUp,
  ArrowRight,
  MapPin,
} from "lucide-react";
import "../CSS/Dashboard.css";

const stats = [
  { title: "Registered Events", value: "12", icon: Calendar },
  { title: "Upcoming Events", value: "5", icon: Clock },
  { title: "Certificates Earned", value: "8", icon: Award },
  { title: "Participation Score", value: "85%", icon: TrendingUp },
];

const events = [
  {
    id: 1,
    title: "Annual Tech Fest 2024",
    date: "Mar 15",
    time: "9:00 AM",
    venue: "Main Auditorium",
    status: "Confirmed",
  },
  {
    id: 2,
    title: "AI & ML Workshop",
    date: "Mar 18",
    time: "2:00 PM",
    venue: "Computer Lab 3",
    status: "Pending",
  },
];

const activities = [
  "Registered for Tech Fest",
  "Earned certificate from Coding Bootcamp",
  "Attended Guest Lecture",
];

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>Welcome back,User 👋</h1>
      <p className="subtitle">
        Here's what's happening with your campus activities.
      </p>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.title} className="stat-card">
            <stat.icon size={24} />
            <div>
              <p className="stat-title">{stat.title}</p>
              <h2>{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="content-grid">
        {/* Events */}
        <div className="card">
          <div className="card-header">
            <h3>Upcoming Events</h3>
            <Link to="/events" className="link">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {events.map((event) => (
            <div key={event.id} className="event-row">
              <Calendar size={18} />
              <div className="event-info">
                <p className="event-title">{event.title}</p>
                <span>
                  <Clock size={14} /> {event.time} · <MapPin size={14} />{" "}
                  {event.venue}
                </span>
              </div>
              <span className={`status ${event.status.toLowerCase()}`}>
                {event.status}
              </span>
            </div>
          ))}
        </div>

        {/* Activity */}
        <div className="card">
          <h3>Recent Activity</h3>
          <ul className="activity-list">
            {activities.map((act, i) => (
              <li key={i}>{act}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
