import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Search, Calendar, MapPin, Clock, Users } from "lucide-react";
import "../CSS/Event.css";

const categories = ["All", "Technology", "Cultural", "Career"];

const Events = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    axios.get("http://localhost:3000/api/events")
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("Backend not connected ❌", err));
  }, []);

  const filteredEvents = events.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || e.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="events-Main">
      <h1>Events</h1>
      <p className="subtitle-event">Discover and register for upcoming campus events.</p>

      <div className="filters">
        <div className="search-box">
          <Search size={23} />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (<option key={c}>{c}</option>))}
        </select>
      </div>

      {/* Events Grid */}
      <div className="events-grid">
        {filteredEvents.map((event) => (
          <div key={event._id} className="event-card">
            <img src={event.image} alt={event.title} />
            <div className="event-content">
              <span className="badge">{event.category}</span>
              <h3>{event.title}</h3>
              <p className="desc">{event.description}</p>
              <div className="info">
                <span><Calendar size={14} /> {event.date}</span>
                <span><Clock size={14} /> {event.time}</span>
                <span><MapPin size={14} /> {event.venue}</span>
                <span><Users size={14} /> {event.attendees}/{event.capacity}</span>
              </div>
              <Link to={`/events/${event._id}`} className="btn-event ">Register Now</Link>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <p className="empty">No events found :(</p>
      )}
    </div>
  );
};

export default Events;

