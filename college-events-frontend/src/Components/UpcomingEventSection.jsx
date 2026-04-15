
import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import "../CSS/UpcomingEventsSection.css";
 const upcomingEvents = [
  {
    id: 1,
    title: "Annual Tech Fest 2024",
    date: "Mar 15, 2024",
    time: "9:00 AM",
    venue: "Main Auditorium",
    category: "Technology",
    attendees: 250,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop",
  },
  {
    id: 2,
    title: "Cultural Night",
    date: "Mar 20, 2024",
    time: "6:00 PM",
    venue: "Open Air Theatre",
    category: "Cultural",
    attendees: 500,
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=250&fit=crop",
  },
  {
    id: 3,
    title: "Career Fair 2024",
    date: "Mar 25, 2024",
    time: "10:00 AM",
    venue: "Sports Complex",
    category: "Career",
    attendees: 800,
    image: "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=400&h=250&fit=crop",
  },
];

export function UpcomingEventsSection() {
  return (
    <section className="events-section">
      <div className="events-container">
        {/* Header */}
        <div className="events-header">
          <div>
            <span className="events-subtitle">Don't Miss Out</span>
            <h2 className="events-title">Upcoming Events</h2>
          </div>

          <Link to="/events" className="view-all-btn">
            View All Events <ArrowRight size={16} />
          </Link>
        </div>

        {/* Events Grid */}
        <div className="events-grid">
          {upcomingEvents.map((event) => (
            <div className="event-card" key={event.id}>
              {/* Image */}
              <div className="event-image">
                <img src={event.image} alt={event.title} />
                <span className={`event-badge ${event.category.toLowerCase()}`}>
                  {event.category}
                </span>
              </div>

              {/* Content */}
              <div className="event-content">
                <h3>{event.title}</h3>

                <div className="event-info">
                  <p>
                    <Calendar size={14} />
                    {event.date} at {event.time}
                  </p>
                  <p>
                    <MapPin size={14} />
                    {event.venue}
                  </p>
                  <p>
                    <Users size={14} />
                    {event.attendees} registered
                  </p>
                </div>

                <Link to={`/events/${event.id}`} className="details-btn">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export default UpcomingEventsSection;