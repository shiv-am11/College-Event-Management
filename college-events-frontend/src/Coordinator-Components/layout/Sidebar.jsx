import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import "../layout/Sidebar.css";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/coordinator/dashboard" },
  { icon: Calendar, label: "My Events", path: "/coordinator/events" },
  { icon: Users , label: "Department Students", path: "/Student/Activities" },
  { icon: Settings, label: "Settings", path: "/Student/settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <GraduationCap size={22} />
        </div>

        {!collapsed && (
          <div>
            <h2>CampusHub</h2>
            <p>Coordinator Panel</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`menu-item ${active ? "active" : ""} ${
                collapsed ? "center" : ""
              }`}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <Link to="/login">
        <button className={`logout-sidebar ${collapsed ? "center" : ""}`}>
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button></Link>
      </div>

      {/* Collapse Button */}
      <button
        className="collapse-btn"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
