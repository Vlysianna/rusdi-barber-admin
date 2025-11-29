import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/hooks/useAuth';
import AdminLayout from './layouts/AdminLayout';
import Login from './features/auth/Login';
import Dashboard from './features/dashboard/Dashboard';
import BookingList from './features/bookings/BookingList';
import BookingDetail from './features/bookings/BookingDetail';
import ServiceList from './features/services/ServiceList';
import StylistList from './features/stylists/StylistList';
import PaymentList from './features/payments/PaymentList';
import CustomerList from './features/customers/CustomerList';
import ReviewList from './features/reviews/ReviewList';
import { Loading } from './shared/components';

// Placeholder components (will be created later)
const Settings = () => <div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Settings Page</h2><p className="text-gray-500 mt-2">Coming Soon</p></div>;

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Memuat..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Memuat..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="bookings" element={<BookingList />} />
            <Route path="bookings/:id" element={<BookingDetail />} />
            <Route path="services" element={<ServiceList />} />
            <Route path="stylists" element={<StylistList />} />
            <Route path="payments" element={<PaymentList />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="reviews" element={<ReviewList />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
