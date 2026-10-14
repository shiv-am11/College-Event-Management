
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "../CSS/ViewRegister.css";
import CoordinatorDashboardLayout from "./layout/CoordinatorDashLayout";

const API_URL = "http://localhost:3000/api/coordinator";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
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

function ActionButton({ status, onClick, disabled }) {
  if (status === "Registered") {
    return (
      <button
        className="btn-mark"
        onClick={onClick}
        disabled={disabled}
      >
        Mark Attended
      </button>
    );
  }

  if (status === "Attended") {
    return (
      <button
        className="btn-generate"
        onClick={onClick}
        disabled={disabled}
      >
        Generate Certificate
      </button>
    );
  }

  return (
    <button
      className="btn-download"
      onClick={onClick}
      disabled={disabled}
    >
      Download
    </button>
  );
}

export default function CoordinatorViewRegister() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_URL}/event/${eventId}/students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const formatted = res.data.map((s) => ({
        id: s._id,
        name: s.name || "Unknown",
        email: s.email || "N/A",
        phone: s.phone || "N/A",
        college: s.college || "N/A",
        course: s.course || "N/A",
        year: s.year || "N/A",
        status: s.status || "Registered",
      }));

      setData(formatted);
    } catch (err) {
      console.error("Error fetching students:", err);

      setError(
        err.response?.data?.message ||
          "Could not load students. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [eventId]);

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

  const toggleSelect = (studentId) => {
    setSelected((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleAll = () => {
    const visibleIds = filtered.map((s) => s.id);
    const allVisibleSelected =
      visibleIds.length > 0 &&
      visibleIds.every((studentId) =>
        selected.includes(studentId)
      );

    setSelected((prev) =>
      allVisibleSelected
        ? prev.filter((id) => !visibleIds.includes(id))
        : [
            ...new Set([
              ...prev,
              ...visibleIds,
            ]),
          ]
    );
  };

  const handleAction = async (student) => {
    if (busyId) return;

    if (student.status === "Registered") {
      try {
        setBusyId(student.id);
        setError("");

        const token = localStorage.getItem("token");

        const res = await axios.patch(
          `${API_URL}/event/${eventId}/students/${student.id}/attendance`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success) {
          setData((prev) =>
            prev.map((s) =>
              s.id === student.id
                ? { ...s, status: "Attended" }
                : s
            )
          );
        }
      } catch (err) {
        console.error("Attendance error:", err);

        setError(
          err.response?.data?.message ||
            "Failed to mark attendance."
        );
      } finally {
        setBusyId(null);
      }

      return;
    }

    if (student.status === "Attended") {
      setError(
        "Certificate generation is not implemented yet."
      );
      return;
    }

    if (student.status === "Certificate Generated") {
      setError(
        "Certificate download is not implemented yet."
      );
    }
  };

  const count = (status) =>
    data.filter((s) => s.status === status).length;

  const exportExcel = (students, fileName) => {
    if (students.length === 0) {
      setError("No students available for this export.");
      return;
    }

    const rows = students.map((s, index) => ({
      "S.No.": index + 1,
      Name: s.name,
      Email: s.email,
      Phone: s.phone,
      College: s.college,
      Course: s.course,
      Year: s.year,
      Status: s.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 24 },
      { wch: 32 },
      { wch: 18 },
      { wch: 24 },
      { wch: 12 },
      { wch: 10 },
      { wch: 24 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Students"
    );

    XLSX.writeFile(workbook, fileName);
    setError("");
  };

  return (
    <CoordinatorDashboardLayout>
      <div>
        {/* HEADER */}
        <div className="hero-Register">
          <button
            className="back-btn-re"
            onClick={() => navigate(-1)}
          >
            ← Back to Events
          </button>

          <h1>Event Registrations</h1>

          <div className="hero-Register-meta">
            <span>{data.length} registered</span>
          </div>
        </div>

        {/* STATS */}
        <div className="stats-row">
          <div className="stat-badge stat-registered">
            <span className="count">
              {count("Registered")}
            </span>{" "}
            Registered
          </div>

          <div className="stat-badge stat-attended">
            <span className="count">
              {count("Attended")}
            </span>{" "}
            Attended
          </div>

          <div className="stat-badge stat-cert">
            <span className="count">
              {count("Certificate Generated")}
            </span>{" "}
            Certificates
          </div>
        </div>

        {/* EXCEL EXPORTS */}
        <div className="toolbar">
          <button
            className="btn-download"
            onClick={() =>
              exportExcel(data, "all-students.xlsx")
            }
          >
            Export All
          </button>

          <button
            className="btn-download"
            onClick={() =>
              exportExcel(
                data.filter(
                  (s) => s.status === "Registered"
                ),
                "registered-students.xlsx"
              )
            }
          >
            Export Registered
          </button>

          <button
            className="btn-download"
            onClick={() =>
              exportExcel(
                data.filter(
                  (s) => s.status === "Attended"
                ),
                "attended-students.xlsx"
              )
            }
          >
            Export Attended
          </button>

          <button
            className="btn-download"
            onClick={() =>
              exportExcel(
                data.filter((s) =>
                  selected.includes(s.id)
                ),
                "selected-students.xlsx"
              )
            }
            disabled={selected.length === 0}
          >
            Export Selected ({selected.length})
          </button>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="toolbar">
          <div className="search-wrap">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <input
              type="text"
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-tabs">
            {[
              "All",
              "Registered",
              "Attended",
              "Certificate",
            ].map((f) => (
              <button
                key={f}
                className={`filter-btn${
                  filter === f ? " active" : ""
                }`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ERROR / LOADING */}
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}

        {loading ? (
          <p>Loading students...</p>
        ) : (
          /* TABLE */
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        filtered.length > 0 &&
                        filtered.every((s) =>
                          selected.includes(s.id)
                        )
                      }
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
                    <td colSpan={7}>
                      No students found :(
                    </td>
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
                          <div className="avatar">
                            {getInitials(s.name)}
                          </div>
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
                          disabled={busyId === s.id}
                          onClick={() => handleAction(s)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CoordinatorDashboardLayout>
  );
}
