import { useState } from "react";
import {
  Search,
  MoreVertical,
  Mail,
  Ban,
  CheckCircle,
} from "lucide-react";
import DashboardLayout from "../Admin-Components/Layout/DashboardLayout";
import "../CSS/Users.css";

const usersData = [
  {
    id: 1,
    name: "John Doe",
    email: "john@college.edu",
    role: "student",
    status: "active",
    department: "Computer Science",
    avatar: "JD",
  },
  {
    id: 2,
    name: "Dr. Sarah Smith",
    email: "sarah@college.edu",
    role: "faculty",
    status: "active",
    department: "Electronics",
    avatar: "SS",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@college.edu",
    role: "student",
    status: "blocked",
    department: "Mechanical",
    avatar: "MJ",
  },
];

export default function Users() {
  const [users, setUsers] = useState(usersData);
  const [search, setSearch] = useState("");
  const [menuId, setMenuId] = useState(null);

  const toggleStatus = (id) => {
    setUsers(
      users.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "blocked" : "active" }
          : u
      )
    );
    setMenuId(null);
  };

  return (
    <DashboardLayout>
      <div className="users-page">
        <h1>Users Management</h1>
        <p className="subtitle">Manage students and faculty</p>

        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="users-grid">
          {users
            .filter(
              (u) =>
                u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase())
            )
            .map((user) => (
              <div className="user-card" key={user.id}>
                <div className="user-top">
                  <div className="avatar">{user.avatar}</div>
                  <div>
                    <h3>{user.name}</h3>
                    <p className="email">
                      <Mail size={14} /> {user.email}
                    </p>
                  </div>

                  <button
                    className="menu-btn"
                    onClick={() =>
                      setMenuId(menuId === user.id ? null : user.id)
                    }
                  >
                    <MoreVertical size={18} />
                  </button>

                  {menuId === user.id && (
                    <div className="dropdown">
                      <button onClick={() => toggleStatus(user.id)}>
                        {user.status === "active" ? (
                          <>
                            <Ban size={14} /> Block
                          </>
                        ) : (
                          <>
                            <CheckCircle size={14} /> Unblock
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="user-footer">
                  <span className={`badge role ${user.role}`}>
                    {user.role}
                  </span>
                  <span
                    className={`badge ${
                      user.status === "active" ? "active" : "blocked"
                    }`}
                  >
                    {user.status}
                  </span>
                  <span className="dept">{user.department}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
