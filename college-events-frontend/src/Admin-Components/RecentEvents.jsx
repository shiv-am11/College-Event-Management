import { Calendar, Clock, MapPin, MoreVertical } from "lucide-react";
import "../CSS/RecentEvents.css"

export default function RecentEvents({events}) {
  return (
    <div className="re-card">
      <h3 className="re-title">Recent Events</h3>

       {events.length === 0 && <p>No events found :(</p>}

      {events.map((event) => (
        <div key={event._id} className="re-row">
          <div className={`re-bar ${event.category.toLowerCase()}`} />

          <div className="re-info">
            <h4>{event.title}</h4>
            <p>{event.category}</p>
            <div className="re-meta">
              <span><Calendar size={14} /> {event.date}</span>
              <span><Clock size={14} /> {event.time}</span>
              <span><MapPin size={14} /> {event.venue}</span>
            </div>
          </div>

          <span className={`re-status ${event.status}`}>{event.status}</span>
          <MoreVertical size={18} />
        </div>
      ))}
    </div>
  );
}
