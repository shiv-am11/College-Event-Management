import { Link } from "react-router-dom";
import {  GraduationCap, Mail, Phone } from "lucide-react";
import "../CSS/Footer.css";

const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
  ],
  resources: [
    { name: "Help Center", href: "#" },
    { name: "Documentation", href: "#" },
    { name: "Community", href: "#" },
  ],
  company: [
    { name: "About Us", href: "#about" },
    { name: "Careers", href: "#" },
    { name: "Contact", href: "#" },
  ],
  legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Top */}
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="logo-icon">
                <GraduationCap size={22} />
              </div>
              <span>CampusHub</span>
            </Link>

            <p className="footer-desc">
              Simplifying college event management for students, faculty, and
              administrators.
            </p>

            <div className="footer-contact">
              <p>
                <Mail size={14} /> support@campushub.edu
              </p>
              <p>
                <Phone size={14} /> +1 (555) 123-4567
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="footer-links">
            <h4>Product</h4>
            {footerLinks.product.map((link) => (
              <a key={link.name} href={link.href}>
                {link.name}
              </a>
            ))}
          </div>

          <div className="footer-links">
            <h4>Resources</h4>
            {footerLinks.resources.map((link) => (
              <a key={link.name} href={link.href}>
                {link.name}
              </a>
            ))}
          </div>

          <div className="footer-links">
            <h4>Company</h4>
            {footerLinks.company.map((link) => (
              <a key={link.name} href={link.href}>
                {link.name}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} CampusHub. All rights reserved.</p>

          <div className="footer-legal">
            {footerLinks.legal.map((link) => (
              <a key={link.name} href={link.href}>
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;