import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import "../CSS/EventsPage.css";
import EventCard from "./EventCard";
import DashboardLayout from "../Admin-Components/Layout/DashboardLayout";
import {Search, SlidersHorizontal} from "lucide-react";

const STATUS = ["All", "Upcoming", "Ongoing", "Completed"];

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // 🔗 Fetch events
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/events")
      .then((res) => {
        setEvents(res.data);
      })
      .catch((err) => console.error(err));
  }, []);


  const getStatus = (dateStr) => {
    const today = new Date();
    const eventDate = new Date(dateStr);

    if (eventDate.toDateString() === today.toDateString()) {
      return "ongoing";
    } else if (eventDate > today) {
      return "upcoming";
    } else {
      return "completed";
    }
  };

  const formattedEvents = useMemo(() => {
    if (!events || events.length === 0) return [];

    return events.map((e) => ({
      id: e._id,
      title: e.title,
      date: e.date,
      time: e.time,
      venue: e.venue,
      category: e.category,
      description: e.description,
      attendees: e.attendees,
      capacity: e.capacity,
      status: getStatus(e.date),
      image: e.image,
    }));
  }, [events]);


  const filtered = useMemo(() => {
    return formattedEvents.filter((e) => {
      const matchSearch = e.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchFilter =
        filter === "All" ||
        e.status.toLowerCase() === filter.toLowerCase();

      return matchSearch && matchFilter;
    });
  }, [search, filter, formattedEvents]);

  return (
    <DashboardLayout>
      <div className="page">

        <div className="header-admin-Event">
          <div className="icon"></div>
          <div>
            <h1>Events Infomation</h1>
            <p>Admin Dashboard</p>
          </div>
        </div>

        <div className="controls">
           <div className="search-box">
           <Search size={18} className="search-icon" />

             <input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filters-admin">
            {STATUS.map((s) => (
              <button
                key={s}
                className={filter === s ? "active" : ""}
                onClick={() => setFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid">
          {filtered.length === 0 ? (
            <p>No events found</p>
          ) : (
            filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}