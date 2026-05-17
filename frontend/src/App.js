import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import "./styles/theme.css";
import "./styles/neumorphic.css";

import { ThemeProvider } from "./context/ThemeContext";
import { DarkModeProvider } from "./context/DarkModeContext";
import { LayoutConfigProvider } from "./context/LayoutConfigContext";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";

import StudentLayout from "./pages/student/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import MyRegisteredEvents from "./pages/student/MyRegisteredEvents";
import PayForEvent from "./pages/student/PayForEvent";
import MyPayments from "./pages/student/MyPayments";
import UpcomingEvents from "./pages/student/UpcomingEvents";
import StudentProfile from "./pages/student/StudentProfile";
import StudentFeedbackPage from "./pages/student/StudentFeedbackPage";



import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateEvent from "./pages/admin/CreateEvent";
import EditEvent from "./pages/admin/EditEvent";
import AdminEventRegistrations from "./pages/admin/AdminEventRegistrations";
import PendingPayments from "./pages/admin/PendingPayments";
import Analytics from "./pages/admin/Analytics";
import Registrations from "./pages/admin/Registrations";
import ManageEvents from "./pages/admin/ManageEvents";

import PaymentSuccess from "./pages/PaymentSuccess";


function App() {
  return (
    <ThemeProvider>
    <DarkModeProvider>
      <LayoutConfigProvider>
        <BrowserRouter>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />


          {/* STUDENT */}
          <Route path="/student" element={<StudentLayout />}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="my/registered" element={<MyRegisteredEvents />} />
            <Route path="events" element={<MyRegisteredEvents />} />
            <Route path="my/payments" element={<MyPayments />} />
            <Route path="upcoming" element={<UpcomingEvents />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="feedback" element={<StudentFeedbackPage />} />
            <Route path="/student/pay/:id" element={<PayForEvent />} />
          
          </Route>

          {/* 🔥 ADMIN LAYOUT ROUTES */}
          <Route path="/admin" element={<AdminLayout />}>
            
            {/* DEFAULT ADMIN PAGE */}
            <Route index element={<AdminDashboard />} />
            <Route path="manage-events" element={<ManageEvents />} />

            {/* OTHER ADMIN PAGES */}
            <Route path="create-event" element={<CreateEvent />} />
            <Route path="edit-event/:id" element={<EditEvent />} />
            <Route
              path="events/:id/registrations"
              element={<AdminEventRegistrations />}
            />

            {/* (future) */}
            <Route path="registrations" element={<Registrations />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="pending-payments" element={<PendingPayments />} />

          </Route>
        </Routes>
        </BrowserRouter>
      </LayoutConfigProvider>
    </DarkModeProvider>
    </ThemeProvider>
  );
}

export default App;
