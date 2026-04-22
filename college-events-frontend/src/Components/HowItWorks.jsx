
import { UserPlus, Search, CheckCircle } from "lucide-react";
import "../CSS/HowItWorksSection.css"

export const steps = [
  {
    step: 1,
    icon: UserPlus,
    title: "Create Your Account",
    description: "Sign up as a student, faculty member, or administrator. Choose your role and complete your profile in minutes.",
  },
  {
    step: 2,
    icon: Search,
    title: "Discover Events",
    description: "Browse upcoming events, filter by category or department, and find activities that match your interests.",
  },
  {
    step: 3,
    icon: CheckCircle,
    title: "Register & Participate",
    description: "Register for events with one click, receive reminders, and earn certificates upon completion.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="how-it-works">
      <div className="container">
        <div className="header">
          <span className="How-subtitle">How It Works</span>
          <h2 className="title">Get Started in Three Simple Steps</h2>
          <p className="description">
            Join thousands of students and faculty members already using CampusHub
          </p>
        </div>

        <div className="steps">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className={`step ${index % 2 === 1 ? "reverse" : ""}`}
              >
                <div className="step-content">
                  <div className="icon-wrapper">
                    <Icon className="icon" />
                  </div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
                <div className="step-number">{step.step}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
export default HowItWorksSection;