import "../CSS/FeaturesSection.css"
import {
  Calendar,
  Users,
  Bell,
  Award,
  BarChart3,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Event Management",
    description:
      "Create, edit, and manage events with an intuitive interface. Set dates, venues, and capacities effortlessly.",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description:
      "Dedicated dashboards for students, faculty, and admins with appropriate permissions and views.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Stay updated with event reminders, registration confirmations, and important announcements.",
  },
  {
    icon: Award,
    title: "Certificates & Badges",
    description:
      "Automatically generate and distribute certificates for event participation and achievements.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track event attendance, engagement metrics, and generate comprehensive reports.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description:
      "Enterprise-grade security with data encryption and regular backups to keep your data safe.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="features-section">
      <div className="features-container">
        {/* Header */}
        <div className="features-header">
          <span className="features-tag">Features</span>
          <h2>Everything You Need to Manage Campus Events</h2>
          <p>
            Powerful tools designed specifically for educational institutions
          </p>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div className="feature-card" key={index}>
                <div className="feature-icon">
                  <Icon size={24} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
