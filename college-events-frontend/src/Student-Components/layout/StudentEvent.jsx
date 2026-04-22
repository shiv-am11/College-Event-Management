import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Search, Calendar, MapPin, Clock, Users } from "lucide-react";
import "./StudentEvents.css";
import { Sidebar } from "./Student-sideBar";
import { TopNavbar } from "./Student-TopNavbar";

const categories = ["All", "Technology", "Cultural", "Career"];

const StudentEvents = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    axios.get("http://localhost:3000/api/student/events")
      .then((res) => {
      setEvents(res.data.events);
    })
    .catch((err) => console.error(err));
}, []);

  const filteredEvents = events.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || e.category === category;
    return matchSearch && matchCategory;
  });
 const handleRegister = async (eventId) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:3000/api/student/events/${eventId}/register`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert("Registered successfully ✅");

    setEvents((prev) =>
      prev.map((e) =>
        e._id === eventId
          ? { ...e, attendees: e.attendees + 1 }
          : e
      )
    );

  } catch (err) {
    console.error(err);
    alert("Error registering");
  }
};
  return (
    <div className="dashboard-layout">
      <Sidebar/>
    <div className="dashboard-main">
      <TopNavbar/>
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
              <button onClick={()=>handleRegister(event._id)}
               className={`btn-event ${event.attendees >= event.capacity ? "full" : ""}`}
               disabled={event.attendees >= event.capacity|| event.registeredStudent?.includes(userId) }
               >{event.attendees >= event.capacity ? "full"
                : event.registeredStudent?.includes(userId)
                ? "Registerd" : "Register Now"}</button>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <p className="empty">No events found :(</p>
      )}
    </div>
    </div>
    </div>
  );
};

export default StudentEvents;