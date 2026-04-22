import { Router, Routes, Route } from "react-router-dom";
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


function App() {
  return (
    
      <Routes>
        <Route path="/" element={<HomePage/>} ></Route>
        <Route path="/SignUp" element={<Signup/>} ></Route>
        <Route path="/Login" element={<Login/>} ></Route>
        <Route path="/events" element={<Events/>} ></Route>
        <Route path="/admin/dashboard" element={<Dashboard/>} ></Route>
        <Route path="/CreateEvent" element={<CreateEvent/>} ></Route>
        <Route path="/registered-students" element={<EventsPage />} ></Route>
        <Route path="/Analytics" element={<Analytics/>} ></Route>
        <Route path="/Users" element={<Users/>} ></Route>
        <Route path="/eventManagement" element={<EventManagement/>} ></Route>
        <Route path="/student/dashboard" element={<DashboardStudent/>} ></Route>
        <Route path="/student/events" element={<StudentEvents />} ></Route>
        <Route path="/admin/event/:id/registrations" element={<ViewRegister />} ></Route>
        
      </Routes>
  )
}

export default App;
