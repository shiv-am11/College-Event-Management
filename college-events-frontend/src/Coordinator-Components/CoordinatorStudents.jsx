import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Search,
  Users,
  ChevronDown,
} from "lucide-react";
import DashboardLayout from "../Coordinator-Components/layout/CoordinatorDashLayout";
import "../Coordinator-Components/CoordinatorStudents.css";

export default function CoordinatorStudents() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please login first.");
          return;
        }

        const response = await fetch(
          "http://localhost:3000/api/coordinator/department-students",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load students.");
        }

        const list = Array.isArray(result) ? result : [];
        setStudents(list);

        const years = [
          ...new Set(
            list
              .map((student) => student.year)
              .filter(
                (year) =>
                  year !== null &&
                  year !== undefined &&
                  String(year).trim() !== ""
              )
              .map(String)
          ),
        ].sort((a, b) => Number(a) - Number(b));

        setSelectedYear(years[0] || "");
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const availableYears = useMemo(
    () =>
      [
        ...new Set(
          students
            .map((student) => student.year)
            .filter(
              (year) =>
                year !== null &&
                year !== undefined &&
                String(year).trim() !== ""
            )
            .map(String)
        ),
      ].sort((a, b) => Number(a) - Number(b)),
    [students]
  );

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesYear = String(student.year ?? "") === selectedYear;

      const matchesSearch =
        !query ||
        (student.name || "").toLowerCase().includes(query) ||
        (student.email || "").toLowerCase().includes(query) ||
        (student.course || "").toLowerCase().includes(query) ||
        String(student.phone || student.phoneNumber || "").includes(query);

      return matchesYear && matchesSearch;
    });
  }, [students, selectedYear, search]);

  const getInitials = (name = "") =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0] || "")
      .join("")
      .toUpperCase();

  return (
    <DashboardLayout>
      <div className="coordinator-students-page">
        <div className="hero-Register">
          <button
            type="button"
            className="back-btn-re"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={14} /> Back
          </button>

          <h1>Department Students</h1>

          <div className="hero-Register-meta">
            <span>
              <Users size={15} /> Student Directory
            </span>
            <span>
              <CalendarDays size={15} /> Year-wise View
            </span>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-badge stat-registered">
            <Users size={17} />
            <span>Total Students</span>
            <span className="count">{students.length}</span>
          </div>

          <div className="stat-badge stat-cert">
            <CalendarDays size={17} />
            <span>Available Years</span>
            <span className="count">{availableYears.length}</span>
          </div>
        </div>

        <div className="regis-content">
          <div className="toolbar">
            <div className="search-wrap">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search by name, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="year-selector">
              <label htmlFor="student-year">Academic Year</label>

              <div className="year-select-wrap">
                <select
                  id="student-year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  disabled={!availableYears.length}
                >
                  {availableYears.length ? (
                    availableYears.map((year) => (
                      <option key={year} value={year}>
                        Year {year}
                      </option>
                    ))
                  ) : (
                    <option value="">No years available</option>
                  )}
                </select>
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="table-wrap">
              <div className="students-message">Loading students...</div>
            </div>
          ) : error ? (
            <div className="table-wrap">
              <div className="students-message students-error">{error}</div>
            </div>
          ) : (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>STUDENT</th>
                      <th>EMAIL</th>
                      <th>PHONE NUMBER</th>
                      <th>DEPARTMENT</th>
                      <th>YEAR</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStudents.length ? (
                      filteredStudents.map((student) => (
                        <tr key={student._id}>
                          <td>
                            <div className="name-cell">
                              <div className="avatar">
                                {getInitials(student.name)}
                              </div>
                              <span>{student.name || "Unnamed Student"}</span>
                            </div>
                          </td>

                          <td>{student.email || "N/A"}</td>

                          <td>
                            {student.phone || student.phoneNumber || "N/A"}
                          </td>

                          <td>{student.course || "N/A"}</td>

                          <td>
                            <span className="year-badge">
                              Year {student.year}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="empty-row">
                        <td colSpan={5}>
                          {students.length === 0
                            ? "No students found in your department."
                            : "No students found for this year or search."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="table-footer">
                <span>
                  Showing {filteredStudents.length} of {students.length} students
                </span>
                <span>
                  {selectedYear ? `Year ${selectedYear}` : "No year selected"}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}