import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CoordinatorEvents.css";
import { Calendar, Clock, MapPin, Search, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `http://localhost:3000/api/coordinator/events`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setEvents(res.data || []);
        setError("");
      } catch (err) {
        console.error("Error fetching coordinator events:", err);
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

  const handleViewRegistrations = (eventId) => {
    navigate(`/coordinator/event/${eventId}/registrations`);
  };

  return (
    <CoordinatorDashboardLayout>
      <div className="events-Main">

        <h1>Events</h1>

        <p className="subtitle-event">
          Discover and manage your department events.
        </p>

        {/* SEARCH */}
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

        {/* LOADING */}
        {loading ? (
          <p>Loading...</p>

        ) : error ? (
          <p>{error}</p>

        ) : filteredEvents.length === 0 ? (
          <p>No department events found.</p>

        ) : (

          <div className="coord-events">

            {filteredEvents.map((event) => {

              // Event schema mein field:
              // registeredStudent
              const registered =
                event.registeredStudent?.length || 0;

              const percentage = event.capacity
                ? Math.min(
                    (registered / event.capacity) * 100,
                    100
                  )
                : 0;

              return (
                <div
                  key={event._id}
                  className="coord-card"
                >

                  {/* IMAGE */}
                  <img
                    src={event.image}
                    alt={event.title}
                  />

                  {/* TITLE */}
                  <h3>{event.title}</h3>

                  {/* DESCRIPTION */}
                  <p className="desc">
                    {event.description}
                  </p>

                  {/* EVENT INFO */}
                  <div className="info">

                    <span>
                      <Calendar size={14} />
                      {formatDate(event.date)}
                    </span>

                    <span>
                      <Clock size={14} />
                      {event.time || "Time not available"}
                    </span>

                    <span>
                      <MapPin size={14} />
                      {event.venue || "Venue not available"}
                    </span>

                  </div>
                  {/* VIEW REGISTRATIONS BUTTON */}
                  <button
                    className="view-registrations-btn"
                    onClick={() =>
                      handleViewRegistrations(event._id)
                    }
                  >
                    <Users size={16} />
                    View Registrations
                  </button>

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

