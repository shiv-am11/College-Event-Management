
import "./Student-DashboardLayout.css";
import { Sidebar } from "./Student-sideBar";
import { TopNavbar } from "./Student-TopNavbar";

function StudentDashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <TopNavbar />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );    
}
export default StudentDashboardLayout