import React from "react";
import "./CoordinatorQuickAction.css";
import { Users, Calendar, ClipboardList, Download } from "lucide-react";

const CoordinatorQuickActions = () => {
  return (
    <div className="Coordi-quick-card">
      <h3 className="title">Quick Actions</h3>

      <div className="Coordi-action-item">
        <div className="Coordi-icon blue">
          <Users size={18} />
        </div>
        <div className="Coordi-text">
          <p className="Coordi-main">View Students</p>
          <p className="Coordi-sub">8 in department</p>
        </div>
        <span className="Coordi-arrow">↗</span>
      </div>

      <div className="Coordi-action-item">
        <div className="Coordi-icon blue">
          <Calendar size={18} />
        </div>
        <div className="Coordi-text">
          <p className="Coordi-main">View Events</p>
          <p className="Coordi-sub">3 upcoming</p>
        </div>
        <span className="Coordi-arrow">↗</span>
      </div>

      <div className="Coordi-action-item">
        <div className="Coordi-icon blue">
          <ClipboardList size={18} />
        </div>
        <div className="Coordi-text">
          <p className="Coordi-main">Registrations</p>
          <p className="Coordi-sub">3 pending</p>
        </div>
        <span className="Coordi-arrow">↗</span>
      </div>

      <div className="Coordi-action-item export">
        <div className="Coordi-icon light">
          <Download size={18} />
        </div>
        <div className="Coordi-text">
          <p className="Coordi-main">Export Data</p>
          <p className="Coordi-sub">CSV report</p>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorQuickActions;