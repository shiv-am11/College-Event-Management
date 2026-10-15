
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
  MessageCircle,
} from "lucide-react";

import "./StudentEvents.css";
import { Sidebar } from "./Student-sideBar";
import { TopNavbar } from "./Student-TopNavbar";

const categories = ["All", "Tech", "Cultural", "Sports", "Career", "Other"];

const API_URL = import.meta.env.VITE_API_URL;

const getStudentId = (student) => {
  if (!student) return "";
  return String(student._id || student.id || student);
};

const StudentEvents = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  // Fetch events from the backend.
  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API_URL}/api/student/events`, {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      });

      const eventList = Array.isArray(res.data.events)
        ? res.data.events
        : Array.isArray(res.data)
          ? res.data
          : [];

      setEvents(eventList);

      // Keep the currently opened modal in sync with refreshed data.
      setSelectedEvent((current) => {
        if (!current) return null;

        return (
          eventList.find(
            (event) => String(event._id) === String(current._id)
          ) || current
        );
      });
    } catch (err) {
      console.error(
        "Error fetching student events:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchSearch = (event.title || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory =
      category === "All" || event.category === category;

    return matchSearch && matchCategory;
  });

  // Check if the logged-in student is already registered.
  const isRegistered = (event) => {
    if (!event || !userId) return false;

    if (
      event.isRegistered === true ||
      event.registered === true
    ) {
      return true;
    }

    const registeredStudents = Array.isArray(event.registeredStudent)
      ? event.registeredStudent
      : [];

    return registeredStudents.some(
      (student) => getStudentId(student) === String(userId)
    );
  };

  const hasWhatsAppLink = (event) => {
    return (
      typeof event?.whatsappLink === "string" &&
      event.whatsappLink.trim().length > 0
    );
  };

  const handleRegister = async (eventId) => {
    if (registering) return;

    if (!userId) {
      alert("Please log in again to register for this event.");
      return;
    }

    const event = events.find(
      (item) => String(item._id) === String(eventId)
    );

    if (!event) return;

    // Prevent another registration attempt from the current UI.
    if (isRegistered(event)) {
      alert("You are already registered for this event.");
      return;
    }

    if (
      Number(event.attendees || 0) >= Number(event.capacity || 0)
    ) {
      alert("Sorry, this event is full.");
      return;
    }

    try {
      setRegistering(true);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/student/events/${eventId}/register`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        // Refresh in case the backend reports an existing registration.
        if (
          res.status === 400 ||
          res.status === 409
        ) {
          await fetchEvents();
        }

        alert(data.message || "Registration failed.");
        return;
      }

      // Update local state immediately after successful registration.
      const updatedEvent = {
        ...event,
        attendees:
          data.event?.attendees ??
          data.attendees ??
          Number(event.attendees || 0) + 1,
        registeredStudent: [
          ...(event.registeredStudent || []).filter(
            (student) => getStudentId(student) !== String(userId)
          ),
          userId,
        ],
        isRegistered: true,
      };

      setEvents((previousEvents) =>
        previousEvents.map((item) =>
          String(item._id) === String(eventId)
            ? { ...item, ...updatedEvent }
            : item
        )
      );

      setSelectedEvent((current) =>
        current && String(current._id) === String(eventId)
          ? { ...current, ...updatedEvent }
          : current
      );

      alert("Registered successfully!");

      // Refresh from the backend to sync the final server state.
      await fetchEvents();
    } catch (err) {
      console.error(
        "Registration error:",
        err.response?.data || err.message
      );

      alert("Error registering. Please try again.");
    } finally {
      setRegistering(false);
    }
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
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* EVENTS GRID */}
          {loading ? (
            <p className="empty">Loading events...</p>
          ) : (
            <>
              <div className="events-grid">
                {filteredEvents.map((event) => (
                  <div key={event._id} className="event-card">
                    <img
                      src={event.image}
                      alt={event.title}
                    />

                    <div className="event-content">
                      <span className="badge">
                        {event.category}
                      </span>

                      <h3>{event.title}</h3>

                      <p className="desc">
                        {event.description}
                      </p>

                      <div className="info">
                        <span>
                          <Calendar size={14} />
                          {event.date
                            ? new Date(event.date).toLocaleDateString(
                                "en-IN"
                              )
                            : "Date TBA"}
                        </span>

                        <span>
                          <Clock size={14} />
                          {event.time || "Time TBA"}
                        </span>

                        <span>
                          <MapPin size={14} />
                          {event.venue || "Venue TBA"}
                        </span>

                        <span>
                          <Users size={14} />
                          {event.attendees || 0}/{event.capacity || 0}
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
                <p className="empty">No events found :(</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* EVENT DETAILS MODAL */}
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
              aria-label="Close event details"
            >
              <X size={20} />
            </button>

            <div className="modal-body">
              <h2>Instructions</h2>

              {selectedEvent.instructions ? (
                <ul className="instructions-list">
                  {selectedEvent.instructions
                    .split(/\r?\n/)
                    .filter((instruction) => instruction.trim())
                    .map((instruction, index) => (
                      <li key={index}>
                        {instruction.trim()}
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="no-instructions">
                  No instructions provided for this event.
                </p>
              )}
            </div>

            <div className="modal-footer">
              {isRegistered(selectedEvent) ? (
                <div className="registered-actions">
                  <button
                    type="button"
                    className="modal-register-btn registered"
                    disabled
                  >
                    <CheckCircle size={18} />
                    Already Registered
                  </button>

                  {hasWhatsAppLink(selectedEvent) && (
                    <a
                      className="whatsapp-join-btn"
                      href={selectedEvent.whatsappLink.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle size={18} />
                      Join WhatsApp Group
                    </a>
                  )}
                </div>
              ) : Number(selectedEvent.attendees || 0) >=
                Number(selectedEvent.capacity || 0) ? (
                <button
                  className="modal-register-btn full"
                  disabled
                >
                  Event Full
                </button>
              ) : (
                <button
                  className="modal-register-btn"
                  onClick={() => handleRegister(selectedEvent._id)}
                  disabled={registering}
                >
                  {registering ? "Registering..." : "Register Now"}
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
