import { useState } from "react";
import {
  Search,
  MoreVertical,
  Mail,
  Ban,
  CheckCircle,
  GraduationCap,
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
    course: "MCA",
    year: "1st Year",
    avatar: "JD",
  },
  {
    id: 2,
    name: "Dr. Sarah Smith",
    email: "sarah@college.edu",
    role: "faculty",
    status: "active",
    course: "BCA",
    avatar: "SS",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@college.edu",
    role: "student",
    status: "blocked",
    course: "BBA",
    year: "2nd Year",
    avatar: "MJ",
  },
  {
    id: 4,
    name: "Emily Brown",
    email: "emily@college.edu",
    role: "student",
    status: "active",
    course: "BA ECO",
    year: "3rd Year",
    avatar: "EB",
  },
  {
    id: 5,
    name: "Alex Wilson",
    email: "alex@college.edu",
    role: "coordinator",
    status: "active",
    course: "MCA",
    avatar: "AW",
  },
  {
    id: 6,
    name: "Robert Taylor",
    email: "robert@college.edu",
    role: "student",
    status: "active",
    course: "BCA",
    year: "2nd Year",
    avatar: "RT",
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
          ? {
              ...u,
              status:
                u.status === "active" ? "blocked" : "active",
            }
          : u
      )
    );

    setMenuId(null);
  };

  const filteredUsers = users.filter((u) => {
    const searchText = search.toLowerCase();

    return (
      u.name.toLowerCase().includes(searchText) ||
      u.email.toLowerCase().includes(searchText) ||
      u.role.toLowerCase().includes(searchText) ||
      u.course.toLowerCase().includes(searchText) ||
      (u.year && u.year.toLowerCase().includes(searchText))
    );
  });

  return (
    <DashboardLayout>
      <div className="users-page">
        <h1>Users Management</h1>

        <p className="subtitle">
          Manage students, faculty and coordinators
        </p>

        <div className="search-box">
          <Search size={18} />

          <input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="users-grid">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div className="user-card" key={user.id}>
                <div className="user-top">
                  <div className="avatar">
                    {user.avatar}
                  </div>

                  <div>
                    <h3>{user.name}</h3>

                    <p className="email">
                      <Mail size={14} />
                      {user.email}
                    </p>
                  </div>

                  <button
                    className="menu-btn"
                    onClick={() =>
                      setMenuId(
                        menuId === user.id ? null : user.id
                      )
                    }
                  >
                    <MoreVertical size={18} />
                  </button>

                  {menuId === user.id && (
                    <div className="dropdown">
                      <button
                        onClick={() => toggleStatus(user.id)}
                      >
                        {user.status === "active" ? (
                          <>
                            <Ban size={14} />
                            Block
                          </>
                        ) : (
                          <>
                            <CheckCircle size={14} />
                            Unblock
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="user-footer">
                  <span
                    className={`badge role ${user.role}`}
                  >
                    {user.role}
                  </span>

                  <span
                    className={`badge ${
                      user.status === "active"
                        ? "active"
                        : "blocked"
                    }`}
                  >
                    {user.status}
                  </span>

                  <span className="dept">
                    <GraduationCap size={14} />
                    {user.course}
                  </span>

                  {user.role === "student" && user.year && (
                    <span className="dept">
                      {user.year}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-users">
              No users found
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
