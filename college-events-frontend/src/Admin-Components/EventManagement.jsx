import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  MoreVertical,
  Check,
  X,
  Pencil,
  Search,
  Save,
} from "lucide-react";

import DashboardLayout from "../Admin-Components/Layout/DashboardLayout";
import "../CSS/EventMangement.css";
import { API_BASE_URL } from "../config/api";

const BASE_URL = API_BASE_URL;
const categories = ["Tech", "Cultural", "Sports", "Career", "Other"];
const courses = ["MCA", "BCA", "BBA", "BA ECO"];

const emptyEditForm = {
  title: "",
  description: "",
  category: "",
  course: "",
  date: "",
  time: "",
  startTime: "",
  endTime: "",
  venue: "",
  capacity: "",
  instructions: "",
  whatsappLink: "",
  image: "",
};

function formatEventDate(value) {
  if (!value) return "Date unavailable";
  const datePart = String(value).slice(0, 10);
  const date = new Date(`${datePart}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatEventTime(value) {
  if (!value) return "Time unavailable";
  const match = String(value).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return String(value);

  const hours = Number(match[1]);
  const minutes = match[2];
  if (hours > 23) return String(value);

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes} ${period}`;
}

function getEventTime(event) {
  if (event.time) return formatEventTime(event.time);
  if (event.startTime || event.endTime) {
    return [event.startTime, event.endTime]
      .filter(Boolean)
      .map(formatEventTime)
      .join(" - ");
  }
  return "Time unavailable";
}

function getCategoryLabel(event) {
  const category = typeof event.category === "string" ? event.category.trim() : "";
  return category || "Not specified";
}

function getDateInputValue(value) {
  if (!value) return "";
  const datePart = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : "";
}

function getEditForm(event) {
  return {
    ...emptyEditForm,
    title: event.title || "",
    description: event.description || "",
    category: event.category || "",
    course: event.course || "",
    date: getDateInputValue(event.date),
    time: event.time || "",
    startTime: event.startTime || "",
    endTime: event.endTime || "",
    venue: event.venue || "",
    capacity: event.capacity ?? "",
    instructions: event.instructions || "",
    whatsappLink: event.whatsappLink || "",
    image: event.image || "",
  };
}

export default function EventManagement() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoadError("");
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/admin/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load events.");
      }

      setEvents(data.events || []);
    } catch (error) {
      setLoadError(error.message || "Unable to load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) =>
    String(event.title || "").toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/admin/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Unable to update event status.");

      setEvents((previous) =>
        previous.map((event) =>
          event._id === id ? { ...event, status } : event
        )
      );
      setOpenMenu(null);
    } catch (error) {
      setLoadError(error.message || "Unable to update event status.");
    }
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setEditForm(getEditForm(event));
    setEditError("");
    setEditSuccess("");
    setOpenMenu(null);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((previous) => ({ ...previous, [name]: value }));
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    setEditError("");
    setEditSuccess("");

    if (!editForm.title.trim() || !editForm.date || !editForm.venue.trim()) {
      setEditError("Title, date, and venue are required.");
      return;
    }
    if (!editForm.course || !editForm.capacity || Number(editForm.capacity) < 1) {
      setEditError("Course and a positive capacity are required.");
      return;
    }
    if (!editForm.time && !editForm.startTime) {
      setEditError("Please provide an event time.");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/admin/events/${editingEvent._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editForm.title.trim(),
          description: editForm.description.trim(),
          category: editForm.category,
          course: editForm.course,
          date: editForm.date,
          time: editForm.time,
          startTime: editForm.startTime,
          endTime: editForm.endTime,
          venue: editForm.venue.trim(),
          capacity: Number(editForm.capacity),
          instructions: editForm.instructions.trim(),
          whatsappLink: editForm.whatsappLink.trim(),
          image: editForm.image.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save event changes.");
      }

      setEditSuccess("Event updated successfully.");
      await fetchEvents();
      setTimeout(() => setEditingEvent(null), 500);
    } catch (error) {
      setEditError(error.message || "Unable to save event changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <h2 style={{ padding: 20 }}>Loading events...</h2>;

  return (
    <DashboardLayout>
      <div className="eventsM-page">
        <div className="eventsM-header">
          <h1>Events Management</h1>
          <p>Manage, approve and control college events</p>
        </div>

        <div className="events-filters">
          <div className="search-box-EM">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

        </div>

        {loadError && <p className="events-feedback error">{loadError}</p>}

        <div className="events-table">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Category</th>
                <th>Date &amp; Time</th>
                <th>Venue</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event._id}>
                  <td>
                    <strong>{event.title || "Untitled event"}</strong>
                    <div className="muted">
                      {event.attendees || 0}/{event.capacity || 0} registered
                    </div>
                  </td>

                  <td>
                    <span className={`badge category ${event.category?.toLowerCase() || ""}`}>
                      {getCategoryLabel(event)}
                    </span>
                  </td>

                  <td className="event-datetime">
                    <div className="row-icon">
                      <Calendar size={14} /> <span>{formatEventDate(event.date)}</span>
                    </div>
                    <div className="row-icon muted">
                      <Clock size={14} /> <span>{getEventTime(event)}</span>
                    </div>
                  </td>

                  <td className="event-venue">
                    <div className="row-icon">
                      <MapPin size={14} /> <span>{event.venue || "Venue unavailable"}</span>
                    </div>
                  </td>

                  <td className="actions">
                    <button
                      type="button"
                      aria-label={`Actions for ${event.title || "event"}`}
                      onClick={() => setOpenMenu(openMenu === event._id ? null : event._id)}
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openMenu === event._id && (
                      <div className="dropdown">
                        {event.status === "pending" && (
                          <>
                            <button type="button" className="success" onClick={() => updateStatus(event._id, "approved")}>
                              <Check size={14} /> Approve
                            </button>
                            <button type="button" className="danger" onClick={() => updateStatus(event._id, "rejected")}>
                              <X size={14} /> Reject
                            </button>
                          </>
                        )}
                        <button type="button" onClick={() => openEdit(event)}>
                          <Pencil size={14} /> Edit
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

      {editingEvent && (
        <div className="event-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !saving) setEditingEvent(null);
        }}>
          <form className="event-edit-modal" onSubmit={saveEdit}>
            <div className="event-modal-header">
              <div>
                <h2>Edit Event</h2>
                <p>Update the event details below.</p>
              </div>
              <button type="button" className="modal-close" onClick={() => setEditingEvent(null)} disabled={saving}>
                <X size={20} />
              </button>
            </div>

            {editError && <p className="events-feedback error">{editError}</p>}
            {editSuccess && <p className="events-feedback success-message">{editSuccess}</p>}

            <div className="event-edit-grid">
              <label className="edit-field edit-field-wide">Title<input name="title" value={editForm.title} onChange={handleEditChange} required /></label>
              <label className="edit-field edit-field-wide">Description<textarea name="description" value={editForm.description} onChange={handleEditChange} rows="3" /></label>
              <label className="edit-field">Category<select name="category" value={editForm.category} onChange={handleEditChange}><option value="">Select category</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
              <label className="edit-field">Course<select name="course" value={editForm.course} onChange={handleEditChange} required><option value="">Select course</option>{courses.map((course) => <option key={course} value={course}>{course}</option>)}</select></label>
              <label className="edit-field">Date<input type="date" name="date" value={editForm.date} onChange={handleEditChange} required /></label>
              <label className="edit-field">Time<input type="time" name="time" value={editForm.time} onChange={handleEditChange} /></label>
              <label className="edit-field">Start time<input type="time" name="startTime" value={editForm.startTime} onChange={handleEditChange} /></label>
              <label className="edit-field">End time<input type="time" name="endTime" value={editForm.endTime} onChange={handleEditChange} /></label>
              <label className="edit-field">Venue<input name="venue" value={editForm.venue} onChange={handleEditChange} required /></label>
              <label className="edit-field">Capacity<input type="number" name="capacity" min="1" value={editForm.capacity} onChange={handleEditChange} required /></label>
              <label className="edit-field edit-field-wide">Instructions<textarea name="instructions" value={editForm.instructions} onChange={handleEditChange} rows="2" /></label>
              <label className="edit-field edit-field-wide">WhatsApp link<input type="url" name="whatsappLink" value={editForm.whatsappLink} onChange={handleEditChange} /></label>
              <label className="edit-field edit-field-wide">Image URL<input type="url" name="image" value={editForm.image} onChange={handleEditChange} /></label>
            </div>

            <div className="event-modal-actions">
              <button type="button" className="modal-cancel" onClick={() => setEditingEvent(null)} disabled={saving}>Cancel</button>
              <button type="submit" className="modal-save" disabled={saving}><Save size={16} /> {saving ? "Saving..." : "Save changes"}</button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
