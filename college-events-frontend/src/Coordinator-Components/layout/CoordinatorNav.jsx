import NotificationBell from "../../Components/NotificationBell";
import UserProfileDropdown from "../../Components/UserProfileDropdown";
import "./CoordinatorNav.css";

export function CoordinatorNav() {
  return (
    <header className="Cordi-top-navbar">
      <div className="Coordi-Admin-hero"></div>

      <div className="Coordi-navbar-actions">
        {/* Dynamic Notifications */}
        <NotificationBell />

        {/* Dynamic Role-Based Profile Dropdown */}
        <UserProfileDropdown />
      </div>
    </header>
  );
}

export default CoordinatorNav;
