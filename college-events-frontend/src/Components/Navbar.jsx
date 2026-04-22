import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../CSS/Navbar.css";
import { GraduationCap } from "lucide-react";
export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "About", href: "#about" },
];

  return (
    <header className="navbar">
      <nav className="navbar-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <div className="logo-icon"><GraduationCap size={22} /></div>
          <span className="logo-text">CampusHub</span>
        </Link>

        {isLanding && (
          <div className="nav-links">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="nav-link">
                {link.name}
              </a>
            ))}
          </div>
        )}

        {/* Auth Buttons */}
        <div className="auth-buttons">
          <Link to="/login" className="btn-ghost">Sign In</Link>
          <Link to="/SignUp" className="btn-Nav">Get Started</Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? "✖" : "☰"}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          {isLanding &&
            navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
          <div className="mobile-auth-buttons">
            <Link to="/login" className="btn btn-ghost w-full">Sign In</Link>
            <Link to="/signup" className="btn btn-primary w-full">Get Started</Link>
          </div>
        </div>
      )}
    </header>
  );
}
export default Navbar;
