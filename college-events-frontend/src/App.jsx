import { Routes, Route } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import Signup from "./Pages/SignUp";
import Login from "./Pages/Login";
import Events from "./Pages/Events";
import Dashboard from "./Pages/Dashboard";
import CreateEvent from "./Admin-Components/CreateEvent";
import Users from "./Admin-Components/Users";
import Analytics from "./Admin-Components/Analytics";
import EventManagement from "./Admin-Components/EventManagement";
import DashboardStudent from "./Pages/DashboardStudent";
import StudentEvents from "./Student-Components/layout/StudentEvent";
import EventsPage from "./Admin-Components/EventsPage";
import ViewRegister from "./Admin-Components/ViewRegister";
import DashboadCoordinator from "./Pages/DashboadCoordinator";
import CoordinatorEvents from "./Coordinator-Components/CoordinatorEvents";
import CoordinatorCreateEvent from "./Coordinator-Components/CoordinatorCreateEvent";
import CoordinatorViewRegister from "./Coordinator-Components/CoordinatorViewRegister";
import CoordinatorStudents from "./Coordinator-Components/CoordinatorStudents";
import { ToastHost } from "./Components/ToastHost";

function App() {
  return (
    <>
      <ToastHost />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/SignUp" element={<Signup />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/events" element={<Events />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/CreateEvent" element={<CreateEvent />} />
        <Route path="/registered-students" element={<EventsPage />} />
        <Route path="/Analytics" element={<Analytics />} />
        <Route path="/Users" element={<Users />} />
        <Route path="/eventManagement" element={<EventManagement />} />
        <Route path="/student/dashboard" element={<DashboardStudent />} />
        <Route path="/student/events" element={<StudentEvents />} />
        <Route path="/admin/event/:id/registrations" element={<ViewRegister />} />
        <Route path="/coordinator/dashboard" element={<DashboadCoordinator />} />
        <Route path="/coordinator/events" element={<CoordinatorEvents />} />
        <Route path="/coordinator/createEvent" element={<CoordinatorCreateEvent />} />
        <Route path="/coordinator/event/:id/registrations" element={<CoordinatorViewRegister />} />
        <Route path="/coordinator/students" element={<CoordinatorStudents />} />
      </Routes>
    </>
  );
}

export default App;