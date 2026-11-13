import NotificationBell from "../../Components/NotificationBell";
import UserProfileDropdown from "../../Components/UserProfileDropdown";
import { Menu } from "lucide-react";
import "./TopNavbar.css";

export function TopNavbar() {
  return (
    <header className="top-navbar">
      <button type="button" className="mobile-menu-toggle" aria-label="Open navigation" onClick={() => window.dispatchEvent(new Event("campushub:toggle-sidebar"))}>
        <Menu size={20} />
      </button>
      <div className="Admin-hero"></div>
      <div className="navbar-actions">
        <NotificationBell enableNavigation role="admin" />

        {/* Dynamic Role-Based Profile Dropdown */}
        <UserProfileDropdown />
      </div>
    </header>
  );
}

export default TopNavbar;
