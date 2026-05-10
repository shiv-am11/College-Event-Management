import "./CoordinatorDashLayout.css";
import { Sidebar } from "./Sidebar";
import { CoordinatorNav } from "./CoordinatorNav";

function CoordinatorDashboardLayout({ children }) {
  return (
    <div className="Coordi-dashboard-layout">
        <Sidebar/>
      <div className="Coordi-dashboard-main">
        <CoordinatorNav/>
        <main className="Coordi-dashboard-content">{children}</main>
      </div>
    </div>
  );    
}
export default CoordinatorDashboardLayout;