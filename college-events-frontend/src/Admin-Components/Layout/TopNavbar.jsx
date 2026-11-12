import NotificationBell from "../../Components/NotificationBell";
import UserProfileDropdown from "../../Components/UserProfileDropdown";
import "./TopNavbar.css";

export function TopNavbar() {
  return (
    <header className="top-navbar">
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
