import DashboardLayout from "../Admin-Components/Layout/DashboardLayout";
import "../CSS/Analytics.css";

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="Admin-analytics">
        <h1>Analytics</h1>
        <p className="Admin-subtitle">Event performance overview</p>

        <div className="Admin-stats-row">
          <div className="stat">156 <span>Total Events</span></div>
          <div className="stat">12.4K <span>Registrations</span></div>
          <div className="stat">88% <span>Attendance</span></div>
          <div className="stat">23% <span>Growth</span></div>
        </div>

        <div className="charts">
          <div className="chart">
            <h3>Events by Category</h3>
            <div className="bar"><span style={{width:"70%"}}>Tech</span></div>
            <div className="bar"><span style={{width:"55%"}}>Cultural</span></div>
            <div className="bar"><span style={{width:"40%"}}>Sports</span></div>
          </div>

          <div className="chart">
            <h3>Monthly Growth</h3>
            <div className="line-chart"></div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
