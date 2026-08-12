import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './redux/userSlice';

// Components & Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import BookingPage from './pages/BookingPage';
import HouseholdBookingsPage from './pages/HouseholdBookingsPage';
import TrackingPage from './pages/TrackingPage';
import GrievancePage from './pages/GrievancePage';
import WorkerJobsPage from './pages/WorkerJobsPage';
import WorkerEarningsPage from './pages/WorkerEarningsPage';
import AdminDashboard from './pages/AdminDashboard';
import PaymentPage from './pages/PaymentPage';
import NotificationsPage from './pages/NotificationsPage';
import NotFound from './pages/NotFound';

import io from 'socket.io-client';

const PublicLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Chatbot />
      <Footer />
    </div>
  );
};

const ProtectedLayout = () => {
  return (
    <AppShell>
      <Outlet />
      <Chatbot />
    </AppShell>
  );
};

const HybridLayout = () => {
  const { userInfo } = useSelector((state) => state.user);
  
  if (userInfo) {
    return (
      <AppShell>
        <Outlet />
        <Chatbot />
      </AppShell>
    );
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Chatbot />
      <Footer />
    </div>
  );
};

const App = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.user);

  useEffect(() => {
    if (token) {
      dispatch(fetchMe());
      
      let backendUrl = 'https://skillconnect-backend-97u2.onrender.com';
      if (process.env.REACT_APP_API_URL) {
        backendUrl = process.env.REACT_APP_API_URL.replace(/\/api$/, '');
      } else if (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
        backendUrl = 'http://localhost:5000';
      }
      const socket = io(backendUrl, {
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });
      window.socket = socket;
      
      const handleRestoreSocketRooms = () => {
        console.log('[Socket] Connected to server.');
        const activeRapido = sessionStorage.getItem('rapido_active_booking');
        if (activeRapido) {
          socket.emit('joinRoom', { room: `booking_${activeRapido}` });
        }
      };

      socket.on('connect', handleRestoreSocketRooms);
      socket.io.on('reconnect', handleRestoreSocketRooms);

      return () => {
        if (window.socket) {
          socket.off('connect', handleRestoreSocketRooms);
          socket.io.off('reconnect', handleRestoreSocketRooms);
          window.socket.disconnect();
          window.socket = null;
        }
      };
    }
  }, [dispatch, token]);

  return (
    <Router>
      <Routes>
        {/* Public Routes with Navbar/Footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Hybrid Routes (AppShell if logged in, Navbar if not) */}
        <Route element={<HybridLayout />}>
          <Route path="/search" element={<SearchPage />} />
        </Route>

        {/* Protected Routes with AppShell */}
        <Route element={
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<WorkerJobsPage />} />
          <Route path="/earnings" element={<WorkerEarningsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-bookings" element={<HouseholdBookingsPage />} />
          <Route path="/booking-request" element={<BookingPage />} />
          <Route path="/payment/:bookingId" element={<PaymentPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/track-booking" element={<TrackingPage />} />
          <Route path="/tracking/:bookingId" element={<TrackingPage />} />
          <Route path="/tracking" element={<TrackingPage />} />
          <Route path="/grievances" element={<GrievancePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          {/* We'll redirect specific app-shell features here as needed */}
        </Route>

        {/* Fallback */}
        <Route path="*" element={
          <PublicLayout>
            <NotFound />
          </PublicLayout>
        } />
      </Routes>
    </Router>
  );
};

export default App;
