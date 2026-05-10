import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CoordinatorEvents.css";
import { Calendar, Clock, MapPin, Search } from "lucide-react";
import CoordinatorDashboardLayout from "./layout/CoordinatorDashLayout";

const formatDate = (dateValue) => {
  if (!dateValue) return "Date not available";

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return parsedDate.toLocaleDateString();
};

const CoordinatorEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/coordinator/events`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setEvents(res.data.events || []);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Unable to load coordinator events.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);
  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CoordinatorDashboardLayout>
      <div className="events-Main">
        <h1>Events</h1>
        <p className="subtitle-event">
          Discover and manage your department events.
        </p>

        <div className="filters">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : filteredEvents.length === 0 ? (
          <p>No department events found.</p>
        ) : (
          <div className="coord-events">
            {filteredEvents.map((event) => {
              const registered = event.registeredStudents?.length || 0;

              const percentage = event.capacity
                ? Math.min((registered / event.capacity) * 100, 100)
                : 0;

              return (
                <div key={event._id} className="coord-card">
                  <img src={event.image} alt={event.title} />
                  <h3>{event.title}</h3>
                  <p className="desc">{event.description}</p>
                  <div className="info">
                    <span>
                      <Calendar size={14} /> {formatDate(event.date)}
                    </span>
                    <span>
                      <Clock size={14} />{" "}
                      {event.time || "Time not available"}
                    </span>
                    <span>
                      <MapPin size={14} />{" "}
                      {event.venue || "Venue not available"}
                    </span>
                  </div>

                  <div className="reg-section">
                    <div className="reg-header">
                      <span>Registrations</span>
                      <span>
                        {registered}/{event.capacity}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CoordinatorDashboardLayout>
  );
};

export default CoordinatorEvents;
