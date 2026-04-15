import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  MoreVertical,
  Check,
  X,
  Pencil,
  Trash2,
  Filter,
  Search,
} from "lucide-react";

import DashboardLayout from "../Admin-Components/Layout/DashboardLayout";
import "../CSS/EventMangement.css";

export default function EventManagement() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState(null);
  const [loading, setLoading] = useState(true);


useEffect(() => {
  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3000/api/admin/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setLoading(false);
    }
  };

  fetchEvents();
}, []);
  const filteredEvents = events.filter((e) => {
    const matchSearch = e.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "all" || e.status === statusFilter;

    return matchSearch && matchStatus;
  });


  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`http://localhost:3000/api/admin/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      setEvents((prev) =>
        prev.map((e) =>
          e._id === id ? { ...e, status } : e
        )
      );

      setOpenMenu(null);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };
  const deleteEvent = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`http://localhost:3000/api/admin/events/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEvents((prev) => prev.filter((e) => e._id !== id));
      setOpenMenu(null);
    } catch (err) {
      console.error("Failed to delete event", err);
    }
  };

  if (loading) return <h2 style={{ padding: 20 }}>Loading events...</h2>;

  return (
    <DashboardLayout>
      <div className="events-page">
        {/* Header */}
        <div className="eventsM-header">
          <h1>Events Management</h1>
          <p>Manage, approve and control college events</p>
        </div>

        {/* Filters */}
        <div className="events-filters">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="status-filter">
            <Filter size={18} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="events-table">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Category</th>
                <th>Date & Time</th>
                <th>Venue</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event._id}>
                  <td>
                    <strong>{event.title}</strong>
                    <div className="muted">
                      {event.attendees}/{event.capacity} registered
                    </div>
                  </td>

                  <td>
                    <span
                      className={`badge category ${event.category?.toLowerCase()}`}
                    >
                      {event.category}
                    </span>
                  </td>

                  <td>
                    <div className="row-icon">
                      <Calendar size={14} /> {event.date}
                    </div>
                    <div className="row-icon muted">
                      <Clock size={14} /> {event.time}
                    </div>
                  </td>

                  <td>
                    <div className="row-icon">
                      <MapPin size={14} /> {event.venue}
                    </div>
                  </td>

                  <td>
                    <span className={`badge status ${event.status}`}>
                      {event.status}
                    </span>
                  </td>

                  <td className="actions">
                    <button onClick={() => setOpenMenu(event._id)}>
                      <MoreVertical size={18} />
                    </button>

                    {openMenu === event._id && (
                      <div className="dropdown">
                        {event.status === "pending" && (
                          <>
                            <button
                              className="success"
                              onClick={() =>
                                updateStatus(event._id, "approved")
                              }
                            >
                              <Check size={14} /> Approve
                            </button>

                            <button
                              className="danger"
                              onClick={() =>
                                updateStatus(event._id, "rejected")
                              }
                            >
                              <X size={14} /> Reject
                            </button>
                          </>
                        )}

                        <button>
                          <Pencil size={14} /> Edit
                        </button>

                        <button
                          className="danger"
                          onClick={() => deleteEvent(event._id)}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEvents.length === 0 && (
            <div className="empty-state">
              <Calendar size={40} />
              <p>No events found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
