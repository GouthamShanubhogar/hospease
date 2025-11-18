import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SocketProvider } from "./services/socket";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import LoadingScreen from "./components/LoadingScreen";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Home from "./pages/home.jsx";
import Login from "./pages/login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Hospitals from "./pages/home.jsx";
import Doctors from "./pages/Doctors.jsx";
import Patients from "./pages/Patients.jsx";
import PatientRegistrationAndBooking from "./pages/PatientRegistrationAndBooking.jsx";
import Appointments from "./pages/Appointments.jsx";
import Wards from "./pages/Wards.jsx";
import Billing from "./pages/Billing.jsx";
import Reception from "./pages/home.jsx";
import Notifications from "./pages/Notifications.jsx";
import Profile from "./pages/profile.jsx";
import PrivateRoute from "./components/PrivateRoute";

// Wrapper component to handle auth loading state
const AppContent = ({ children }) => {
  const { loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <SocketProvider>
      {children}
    </SocketProvider>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <BrowserRouter>
          <AuthProvider>
            <AppContent>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/patient-booking" element={<PatientRegistrationAndBooking />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/hospitals" element={<PrivateRoute><Hospitals /></PrivateRoute>} />
              <Route path="/doctors" element={<PrivateRoute><Doctors /></PrivateRoute>} />
              <Route path="/patients" element={<PrivateRoute><Patients /></PrivateRoute>} />
              <Route path="/appointments" element={<PrivateRoute><Appointments /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/wards" element={<PrivateRoute><Wards /></PrivateRoute>} />
              <Route path="/billing" element={<PrivateRoute><Billing /></PrivateRoute>} />
              <Route path="/reception" element={<PrivateRoute><Reception /></PrivateRoute>} />
              <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
            </Routes>
            </AppContent>
          </AuthProvider>
        </BrowserRouter>
      </LocalizationProvider>
    </div>
  );
}

export default App;
