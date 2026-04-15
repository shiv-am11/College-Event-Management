import { Users, ArrowRight } from "lucide-react";
import "../CSS/UpcomingEvents.css";

export default function UpcomingEvents({ events }) {

  const getDaysLeft = (dateStr) => {
    const today = new Date();
    const eventDate = new Date(dateStr);
    const diffTime = eventDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const upcomingEvents = events
    .filter(
      (e) =>
        new Date(e.date) > new Date() &&
        e.status === "approved"
    )
    .map((e) => ({
      ...e,
      days: getDaysLeft(e.date),
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="ue-card">
      <h3>Upcoming Events</h3>

      {upcomingEvents.length === 0 ? (
        <p>No upcoming events</p>
      ) : (
        upcomingEvents.map((e) => {
          const percent = Math.min(
            (e.attendees / e.capacity) * 100,
            100
          );

          return (
            <div key={e._id} className="ue-item">
              <div className="ue-header">
                <div>
                  <h4>{e.title}</h4>
                  <p>{e.date}</p>
                </div>
                <span>{e.days} days left</span>
              </div>

              <div className="ue-progress">
                <div style={{ width: `${percent}%` }} />
              </div>

              <p className="ue-capacity">
                <Users size={14} /> {e.attendees}/{e.capacity}
              </p>
            </div>
          );
        })
      )}

      <button className="ue-btn">
        View all upcoming <ArrowRight size={16} />
      </button>
    </div>
  );
}
