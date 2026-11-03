import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import PostLoadModal from './components/loadOwner/PostLoadModal';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Shared Pages
import HomePage from './pages/shared/HomePage';
import ProfilePage from './pages/shared/ProfilePage';

// Load Owner Pages
import MyLoadsOwner from './pages/loadOwner/MyLoadsOwner';
import TransportersDirectory from './pages/loadOwner/TransportersDirectory';
import FriendsDrivers from './pages/loadOwner/FriendsDrivers';

// Transporter Pages
import MyLoadsTransporter from './pages/transporter/MyLoadsTransporter';
import DriversDirectory from './pages/transporter/DriversDirectory';
import OwnersDirectory from './pages/transporter/OwnersDirectory';

// Driver Pages
import AvailableLoadsDriver from './pages/driver/AvailableLoadsDriver';
import TransportersDirectoryDriver from './pages/driver/TransportersDirectoryDriver';
import FriendsDriverPeer from './pages/driver/FriendsDriverPeer';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  const { user, isAuthenticated } = useAuth();
  const [postLoadOpen, setPostLoadOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar onOpenPostLoad={() => setPostLoadOpen(true)} />

      <main className="flex-1">
        <Routes>
          {/* Public / Shared */}
          <Route path="/" element={<HomePage onOpenPostLoad={() => setPostLoadOpen(true)} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Load Owner Routes */}
          <Route
            path="/owner/loads"
            element={
              <ProtectedRoute allowedRoles={['load_owner']}>
                <MyLoadsOwner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/transporters"
            element={
              <ProtectedRoute allowedRoles={['load_owner']}>
                <TransportersDirectory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/drivers"
            element={
              <ProtectedRoute allowedRoles={['load_owner']}>
                <FriendsDrivers />
              </ProtectedRoute>
            }
          />

          {/* Transporter Routes */}
          <Route
            path="/transporter/loads"
            element={
              <ProtectedRoute allowedRoles={['transporter']}>
                <MyLoadsTransporter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transporter/drivers"
            element={
              <ProtectedRoute allowedRoles={['transporter']}>
                <DriversDirectory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transporter/owners"
            element={
              <ProtectedRoute allowedRoles={['transporter']}>
                <OwnersDirectory />
              </ProtectedRoute>
            }
          />

          {/* Driver Routes */}
          <Route
            path="/driver/available-loads"
            element={
              <ProtectedRoute allowedRoles={['driver']}>
                <AvailableLoadsDriver />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/transporters"
            element={
              <ProtectedRoute allowedRoles={['driver']}>
                <TransportersDirectoryDriver />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/friends"
            element={
              <ProtectedRoute allowedRoles={['driver']}>
                <FriendsDriverPeer />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Global Post Load Modal for Load Owners */}
      {isAuthenticated && user?.role === 'load_owner' && (
        <PostLoadModal
          isOpen={postLoadOpen}
          onClose={() => setPostLoadOpen(false)}
          onPostSuccess={() => {
            // If on the loads page, reload or navigate
            if (window.location.pathname !== '/owner/loads') {
              window.location.href = '/owner/loads';
            }
          }}
        />
      )}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
};

export default App;
