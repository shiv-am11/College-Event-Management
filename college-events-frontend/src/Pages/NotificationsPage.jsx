import { useNavigate } from "react-router-dom";
import StudentDashboardLayout from "../Student-Components/layout/StudentDashboardLayout";
import CoordinatorDashboardLayout from "../Coordinator-Components/layout/CoordinatorDashLayout";
import DashboardLayout from "../Admin-Components/Layout/DashboardLayout";
import NotificationList from "../Components/NotificationList";
import { useNotifications } from "../Components/useNotifications";
import { getNotificationDestination } from "../Components/notificationNavigation";
import "../CSS/NotificationBell.css";
import "../CSS/NotificationsPage.css";

const LAYOUTS = {
  student: StudentDashboardLayout,
  coordinator: CoordinatorDashboardLayout,
  admin: DashboardLayout,
};

export default function NotificationsPage({ role }) {
  const navigate = useNavigate();
  const Layout = LAYOUTS[role];
  const notificationState = useNotifications({ limit: 20 });

  if (!Layout) return null;

  const handleNotificationClick = async (notification) => {
    const marked = await notificationState.markAsRead(notification);
    if (!marked) return;
    const destination = getNotificationDestination(notification, role);
    if (destination) navigate(destination);
  };

  return (
    <Layout>
      <main className="notifications-page">
        <div className="notifications-page-header">
          <div>
            <h1>Notifications</h1>
            <p>Review updates and activity related to your CampusHub account.</p>
          </div>
          <button type="button" onClick={notificationState.refresh}>Refresh</button>
        </div>
        <section className="notification-panel notification-page-panel">
          <NotificationList
            {...notificationState}
            onMarkAsRead={handleNotificationClick}
            onMarkAllAsRead={notificationState.markAllAsRead}
            onRefresh={notificationState.refresh}
            onLoadMore={notificationState.loadMore}
            hasMore={Boolean(notificationState.pagination?.hasMore)}
            fullPage
          />
        </section>
      </main>
    </Layout>
  );
}

