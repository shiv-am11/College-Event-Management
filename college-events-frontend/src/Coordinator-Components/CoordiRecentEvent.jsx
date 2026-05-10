import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CoordiRecentEvent.css";

const getStatusClass = (status) => {
  if (status === "pending") return "status ongoing";
  if (status === "approved") return "status upcoming";
  return "status completed";
};

const formatDate = (dateValue) => {
  if (!dateValue) return "Date not available";

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return parsedDate.toLocaleDateString();
};

const CoordiRecentEvent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:3000/api/coordinator/events",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setEvents(res.data.events || []);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="card">
      <div className="Coordi-card-header">
        <h3>Recent Events</h3>
        <span className="Coordi-view-all">View all</span>
      </div>

      <div className="event-list">
        {loading ? (
          <p>Loading...</p>
        ) : events.length === 0 ? (
          <p>No events found</p>
        ) : (
          events.map((event) => (
            <div key={event._id} className="event-item">
              <div>
                <h4>{event.title}</h4>
                <p>
                  {formatDate(event.date)} - {event.venue || "Venue not available"}
                </p>
              </div>

              <div className="right-section">
                <span className="count">
                  {event.registeredStudent?.length || 0}/{event.capacity}
                </span>

                <span className={getStatusClass(event.status)}>
                  <span className="dot"></span>
                  {event.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CoordiRecentEvent;
