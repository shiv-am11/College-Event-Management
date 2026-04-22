import { Calendar, Clock, MapPin, Users } from "lucide-react";
import '../CSS/EventCard.css'
import { useNavigate } from "react-router-dom";



function EventCard({ event }) {
  const navigate = useNavigate()

  return (
    <div className="event-card">
      <img src={event.image || "/default.jpg"} alt={event.title} />

      <div className="event-content">
        <span className="badge">{event.category || "General"}</span>

        <h3>{event.title}</h3>

        <p className="desc">
          {event.description
            ? event.description.slice(0, 50) + "..."
            : "No description available"}
        </p>

        <div className="info">
          <span>
            <Calendar size={14} /> {event.date}
          </span>

          <span>
            <Clock size={14} /> {event.time || "N/A"}
          </span>

          <span>
            <MapPin size={14} /> {event.venue || "No venue"}
          </span>

          <span className="count-Stundent">
            <Users  style={{color:"black"}} size={14} color="#4f46e5" />{" "}
            {event.attendees || 0}/{event.capacity || 0}
          </span>
        </div>

        <button
          className="btn-event"
          style={{ backgroundColor: "#4f46e5" , width:"270px" ,height:"auto" ,fontSize:"14px" }}
          onClick={() => navigate(`/admin/event/${event.id}/registrations`)}
        >
          View Registration
        </button>
      </div>
    </div>
  );
}

export default EventCard;