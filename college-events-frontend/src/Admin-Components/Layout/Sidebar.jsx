import { useEffect, useState } from "react";
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
import "../Layout/Sidebar.css";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Calendar, label: "Events Management", path: "/eventManagement" },
  { icon: PlusCircle, label: "Create Event", path: "/CreateEvent" },
  { icon: Users, label: "Registered Student", path: "/registered-students" },
  { icon: Users, label: "Users", path: "/Users" },
  { icon: BarChart3, label: "Analytics", path: "/Analytics" },
  { icon: Settings, label: "Settings", path: "/admin/profile" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const toggleSidebar = () => setMobileOpen((open) => !open);
    window.addEventListener("campushub:toggle-sidebar", toggleSidebar);
    return () => window.removeEventListener("campushub:toggle-sidebar", toggleSidebar);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {mobileOpen && (
        <button type="button" className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
      )}
    <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <GraduationCap size={22} />
        </div>

        {!collapsed && (
          <div>
            <h2>EventHub</h2>
            <p>Admin Panel</p>
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
              className={`menu-item-admin ${active ? "active" : ""} ${
                collapsed ? "center" : ""
              }`}
              onClick={() => setMobileOpen(false)}
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
    </>
  );
}
