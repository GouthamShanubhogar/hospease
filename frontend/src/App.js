import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SocketProvider } from "./services/socket";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import LoadingScreen from "./components/LoadingScreen";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Hospitals from "./pages/hospitals";
import Doctors from "./pages/doctors";
import Patients from "./pages/Patients";
import Appointments from "./pages/appointments";
import Wards from "./pages/Wards";
import Billing from "./pages/Billing";
import Reception from "./pages/reception";
import Notifications from "./pages/notifications";
import Profile from "./pages/profile";
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
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/hospitals" element={<PrivateRoute><Hospitals /></PrivateRoute>} />
              <Route path="/doctors" element={
                <PrivateRoute roles={['admin', 'staff']}>
                  <Doctors />
                </PrivateRoute>
              } />
              <Route path="/patients" element={
                <PrivateRoute roles={['admin', 'doctor', 'staff']}>
                  <Patients />
                </PrivateRoute>
              } />
              <Route path="/appointments" element={<PrivateRoute><Appointments /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/wards" element={
                <PrivateRoute roles={['admin', 'staff']}>
                  <Wards />
                </PrivateRoute>
              } />
              <Route path="/billing" element={
                <PrivateRoute roles={['admin', 'staff']}>
                  <Billing />
                </PrivateRoute>
              } />
              <Route path="/reception" element={
                <PrivateRoute roles={['admin', 'staff']}>
                  <Reception />
                </PrivateRoute>
              } />
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
