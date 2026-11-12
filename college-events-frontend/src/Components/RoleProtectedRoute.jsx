import { Navigate } from "react-router-dom";

const ROLE_ROUTES = {
  student: "/student/profile",
  coordinator: "/coordinator/profile",
  admin: "/admin/profile",
  faculty: "/faculty/profile",
};

function getTokenRole() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "";
    const payload = token.split(".")[1];
    if (!payload) return "";
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return String(JSON.parse(atob(normalized)).role || "").toLowerCase().trim();
  } catch {
    return "";
  }
}

export default function RoleProtectedRoute({ allowedRole, children }) {
  const token = localStorage.getItem("token");
  const role = getTokenRole() || String(localStorage.getItem("role") || "").toLowerCase().trim();

  if (!token || !role) {
    return <Navigate to="/Login" replace />;
  }

  if (role !== allowedRole) {
    return <Navigate to={ROLE_ROUTES[role] || "/Login"} replace />;
  }

  return children;
}
