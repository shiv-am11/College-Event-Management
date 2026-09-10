
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Calendar,
  MapPin,
  Clock,
  Users,
  X,
  CheckCircle,
} from "lucide-react";

import "./StudentEvents.css";
import { Sidebar } from "./Student-sideBar";
import { TopNavbar } from "./Student-TopNavbar";

const categories = ["All", "Tech", "Cultural", "Sports", "Career", "Other"];

const StudentEvents = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const userId = localStorage.getItem("userId");
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/student/events`)
      .then((res) => {
        setEvents(res.data.events);
      })
      .catch((err) => console.error(err));
  }, []);

  const filteredEvents = events.filter((e) => {
    const matchSearch = e.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory =
      category === "All" || e.category === category;

    return matchSearch && matchCategory;
  });
  const handleRegister = async (eventId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/student/events/${eventId}/register`,
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
            ? {
                ...e,
                attendees: e.attendees + 1,
                registeredStudent: [
                  ...(e.registeredStudent || []),
                  userId,
                ],
              }
            : e
        )
      );

      // Modal ke andar bhi data update
      setSelectedEvent((prev) =>
        prev && prev._id === eventId
          ? {
              ...prev,
              attendees: prev.attendees + 1,
              registeredStudent: [
                ...(prev.registeredStudent || []),
                userId,
              ],
            }
          : prev
      );
    } catch (err) {
      console.error(err);
      alert("Error registering");
    }
  };
  const isRegistered = (event) => {
    return event?.registeredStudent?.some(
      (id) => String(id) === String(userId)
    );
  };

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <div className="dashboard-main">

        <TopNavbar />

        <div className="events-Main">

          <h1>Events</h1>

          <p className="subtitle-event">
            Discover and register for upcoming campus events.
          </p>

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

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

          </div>

          {/* =========================
              EVENTS GRID
          ========================= */}

          <div className="events-grid">

            {filteredEvents.map((event) => (

              <div
                key={event._id}
                className="event-card"
              >

                {/* IMAGE */}

                <img
                  src={event.image}
                  alt={event.title}
                />

                <div className="event-content">

                  {/* CATEGORY */}

                  <span className="badge">
                    {event.category}
                  </span>

                  {/* TITLE */}

                  <h3>
                    {event.title}
                  </h3>

                  {/* DESCRIPTION */}

                  <p className="desc">
                    {event.description}
                  </p>

                  {/* EVENT INFO */}

                  <div className="info">

                    <span>
                      <Calendar size={14} />
                      {event.date.split("T")[0]}
                    </span>

                    <span>
                      <Clock size={14} />
                      {event.time}
                    </span>

                    <span>
                      <MapPin size={14} />
                      {event.venue}
                    </span>

                    <span>
                      <Users size={14} />
                      {event.attendees}/{event.capacity}
                    </span>

                  </div>
                  <button
                    className="view-details-btn"
                    onClick={() => setSelectedEvent(event)}
                  >
                    View Details
                  </button>

                </div>

              </div>

            ))}

          </div>
          {filteredEvents.length === 0 && (
            <p className="empty">
              No events found :(
            </p>
          )}

        </div>

      </div>
      {selectedEvent && (

        <div
          className="event-modal-overlay"
          onClick={() => setSelectedEvent(null)}
        >

          <div
            className="event-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedEvent(null)}
            >
              <X size={20} />
            </button>

            <div className="modal-body">

              <h2>
                Instructions
              </h2>

              {selectedEvent.instructions ? (

                <ul className="instructions-list">

                  {selectedEvent.instructions
                    .split(/\r?\n/)
                    .filter(
                      (instruction) =>
                        instruction.trim()
                    )
                    .map(
                      (instruction, index) => (

                        <li key={index}>
                          {instruction.trim()}
                        </li>

                      )
                    )}

                </ul>

              ) : (

                <p className="no-instructions">
                  No instructions provided for this event.
                </p>

              )}

            </div>
            <div className="modal-footer">

              {/* EVENT FULL */}

              {selectedEvent.attendees >=
              selectedEvent.capacity ? (

                <button
                  className="modal-register-btn full"
                  disabled
                >
                  Event Full
                </button>

              ) : isRegistered(selectedEvent) ? (
                <button
                  className="modal-register-btn registered"
                  disabled
                >

                  <span className="registered-text">

                    <CheckCircle size={18} />

                    Registered

                  </span>

                  <span className="cancel-hover">

                    <X size={18} />

                    Cancel Registration

                  </span>

                </button>

              ) : (
                <button
                  className="modal-register-btn"
                  onClick={() =>
                    handleRegister(selectedEvent._id)
                  }
                >
                  Register Now
                </button>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default StudentEvents;
