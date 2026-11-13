import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Activity,
  Users,
  Award,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  X,
} from "lucide-react";
import "../layout/Student-sideBar.css";
import "./CertificatesComingSoon.css";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/student/dashboard" },
  { icon: Calendar, label: "Events", path: "/student/events" },
  { icon: Activity, label: "My Activities", path: "/student/activities" },
  { icon: Users, label: "Certificates", path: "/student/certificates" },
  { icon: Settings, label: "Settings", path: "/student/profile" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCertificates, setShowCertificates] = useState(false);
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
            <h2>CampusHub</h2>
            <p>Student Panel</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active =
            location.pathname.toLowerCase() === item.path.toLowerCase();

          return (
            item.label === "Certificates" ? (
              <button
                key={item.path}
                type="button"
                className={`menu-item menu-item-button ${
                  collapsed ? "center" : ""
                }`}
                onClick={() => setShowCertificates(true)}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                className={`menu-item ${active ? "active" : ""} ${
                  collapsed ? "center" : ""
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          );
        })}
      </nav>

      {showCertificates && (
        <div
          className="certificates-coming-soon-backdrop"
          role="presentation"
          onClick={() => setShowCertificates(false)}
        >
          <section
            className="certificates-coming-soon-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="certificates-coming-soon-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="certificates-close-button"
              aria-label="Close certificates message"
              onClick={() => setShowCertificates(false)}
            >
              <X size={20} />
            </button>

            <div className="certificate-illustration" aria-hidden="true">
              <Award size={56} strokeWidth={1.8} />
              <span className="certificate-sparkle certificate-sparkle-one" />
              <span className="certificate-sparkle certificate-sparkle-two" />
            </div>

            <h2 id="certificates-coming-soon-title">
              Certificates Coming Soon!
            </h2>
            <p>
              We're working on making your certificates accessible in one
              place. Stay tuned!
            </p>
            <Link
              to="/student/dashboard"
              className="certificates-back-button"
              onClick={() => setShowCertificates(false)}
            >
              Back to Dashboard
            </Link>
          </section>
        </div>
      )}

      {/* Logout */}
      <div className="sidebar-footer">
        <Link to="/login">
          <button className={`logout-sidebar ${collapsed ? "center" : ""}`}>
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </Link>
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
