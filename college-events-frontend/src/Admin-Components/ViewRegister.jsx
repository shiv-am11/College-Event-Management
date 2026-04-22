import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../CSS/ViewRegister.css";
import DashboardLayout from "./Layout/DashboardLayout";

function getInitials(name) {
  return name.split(" ").map((n) => n[0]).join("");
}
function StatusBadge({ status }) {
  const cls =
    status === "Attended"
      ? "badge badge-attended"
      : status === "Certificate Generated"
      ? "badge badge-cert"
      : "badge badge-registered";
  return <span className={cls}>{status}</span>;
}

function ActionButton({ status, onClick }) {
  if (status === "Registered") {
    return <button className="btn-mark" onClick={onClick}>Mark Attended</button>;
  }
  if (status === "Attended") {
    return <button className="btn-generate" onClick={onClick}>Generate Certificate</button>;
  }
  return <button className="btn-download">Download</button>;
}

export default function ViewRegister() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  console.log("EVENT ID:", id);

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`http://localhost:3000/api/admin/event/${id}/registrations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const formatted = res.data.students.map((s) => ({
          id: s._id,
          name: s.name,
          email: s.email,
          phone: s.phone || "N/A",
          college: s.college || "N/A",
          status: "Registered",
        }));

        setData(formatted);
      })
      .catch((err) => console.error(err));
  }, [id]);

  const filtered = data.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.college.toLowerCase().includes(q);

    const matchFilter =
      filter === "All" ||
      (filter === "Certificate"
        ? s.status === "Certificate Generated"
        : s.status === filter);

    return matchSearch && matchFilter;
  });

  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map((s) => s.id));

  const handleAction = (id, status) => {
    setData((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        if (status === "Registered") return { ...s, status: "Attended" };
        if (status === "Attended") return { ...s, status: "Certificate Generated" };
        return s;
      })
    );
  };

  const count = (st) => data.filter((s) => s.status === st).length;

  return (
    <DashboardLayout>
      <div>
        {/* HEADER */}
        <div className="hero-Register">
          
          <button className="back-btn-re" onClick={() => navigate(-1)}>
            ← Back to Events
          </button>

          <h1>Event Registrations</h1>

          <div className="hero-Register-meta">
            <span>{data.length} registered</span>
          </div>
        </div>
        <div className="stats-row">
          <div className="stat-badge stat-registered">
            <span className="count">{count("Registered")}</span> Registered
          </div>
          <div className="stat-badge stat-attended">
            <span className="count">{count("Attended")}</span> Attended
          </div>
          <div className="stat-badge stat-cert">
            <span className="count">{count("Certificate Generated")}</span> Certificates
          </div>
        </div>

        <div className="toolbar">
         <div className="search-wrap"> <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> </svg> 
         <input type="text" placeholder="Search student..." 
         value={search} onChange={(e) => 
         setSearch(e.target.value)} />
          </div>

          <div className="filter-tabs">
            {["All", "Registered", "Attended", "Certificate"].map((f) => (
              <button
                key={f}
                className={`filter-btn${filter === f ? " active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                  />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>College</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>No students found:(</td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(s.id)}
                        onChange={() => toggleSelect(s.id)}
                      />
                    </td>

                    <td>
                      <div className="name-cell">
                        <div className="avatar">{getInitials(s.name)}</div>
                        {s.name}
                      </div>
                    </td>

                    <td>{s.email}</td>
                    <td>{s.phone}</td>
                    <td>{s.college}</td>

                    <td>
                      <StatusBadge status={s.status} />
                    </td>

                    <td>
                      <ActionButton
                        status={s.status}
                        onClick={() => handleAction(s.id, s.status)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}