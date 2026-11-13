import NotificationBell from "../../Components/NotificationBell";
import UserProfileDropdown from "../../Components/UserProfileDropdown";
import { Menu } from "lucide-react";
import "./CoordinatorNav.css";

export function CoordinatorNav() {
  return (
    <header className="Cordi-top-navbar">
      <button type="button" className="mobile-menu-toggle" aria-label="Open navigation" onClick={() => window.dispatchEvent(new Event("campushub:toggle-sidebar"))}>
        <Menu size={20} />
      </button>
      <div className="Coordi-Admin-hero"></div>

      <div className="Coordi-navbar-actions">
        {/* Dynamic Notifications */}
        <NotificationBell enableNavigation role="coordinator" />

        {/* Dynamic Role-Based Profile Dropdown */}
        <UserProfileDropdown />
      </div>
    </header>
  );
}

export default CoordinatorNav;
