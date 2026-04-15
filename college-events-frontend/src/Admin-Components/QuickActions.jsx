import { Link } from "react-router-dom";
import { PlusCircle, Users, Calendar, FileText } from "lucide-react";
import "../CSS/QuickActions.css"

const actions = [
  {
    icon: PlusCircle,
    label: "Create Event",
    description: "Add a new event",
    path: "/CreateEvent",
    color: "gradient-primary",
  },
  {
    icon: Users,
    label: "Add User",
    description: "Register new user",
    path: "/users",
    color: "gradient-green",
  },
  {
    icon: Calendar,
    label: "View Calendar",
    description: "Event schedule",
    path: "/events",
    color: "gradient-orange",
  },
  {
    icon: FileText,
    label: "Generate Report",
    description: "Export analytics",
    path: "/analytics",
    color: "gradient-rose",
  },
];

function QuickActions() {
  return (
    <div className="qa-card">
      <h3 className="qa-title">Quick Actions</h3>

      <div className="qa-grid">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link to={action.path} key={action.path} className="qa-item">
              <div className={`qa-icon ${action.color}`}>
                <Icon size={20} color="#fff" />
              </div>
              <h4>{action.label}</h4>
              <p>{action.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
export default QuickActions;