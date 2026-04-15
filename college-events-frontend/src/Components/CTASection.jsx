import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "../CSS/CTASection.css";

export function CTASection() {
  return (
    <section className="cta-section" id="about">
      <div className="cta-container">
        <h2 className="cta-title">
          Ready to Transform Your Campus Events?
        </h2>

        <p className="cta-text">
          Join the growing community of colleges using CampusHub to streamline
          event management and boost student engagement.
        </p>

        <div className="cta-buttons">
          <Link to="/signup" className="cta-btn primary">
            Start Free Trial
            <ArrowRight size={18} />
          </Link>

          <Link to="/contact" className="cta-btn outline">
            Schedule a Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
