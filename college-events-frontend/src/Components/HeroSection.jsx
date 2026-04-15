import { Link } from "react-router-dom";
import "../CSS/HeroSection.css";
import User from "../assets/users.svg";
import Cal from "../assets/calendar.svg";
import Award from "../assets/award.svg";

export function HeroSection() {
  return (
    <section className="hero">
      {/* Background blobs */}
      <div className="hero-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      <div className="bg-container">
        
      </div>

      <div className="hero-container">

        {/* Heading */}
        <h1 className="hero-title">
          Manage College Events{" "}
          <span className="gradient-text">Effortlessly</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          A unified platform for students, faculty, and administrators to
          discover, organize, and participate in campus events and activities.
        </p>

        {/* Buttons */}
        <div className="hero-buttons">
  <Link to="/signup" className="btn-primary-large">
    Get Started Free →
  </Link>

  <Link to="/events" className="btn-outline-small">
    Browse Events
  </Link>
</div>


        {/* Stats */}
        <div className="hero-stats">
          <div className="stat">
            <div className="icons"><img src={Cal} />
            <h3>500+</h3></div>
            <p>Events Hosted</p>
          </div>
          <div className="stat">
            <div className="icons"><img src={User} />
            <h3>1K+</h3></div>
            <p>Active Users</p>
          </div>
          <div className="stat">
             <div className="icons"><img src={Award} />
            <h3>98%</h3></div>
            <p>Satisfaction</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
