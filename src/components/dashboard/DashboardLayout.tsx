import React, { useState, useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { authService } from "../../services/authService";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { User } from "../../types";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear invalid auth data
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handle mobile menu toggle
  const handleMobileMenuToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Get page title from route
  const getPageTitle = () => {
    const path = location.pathname;
    const titleMap: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/dashboard/stylists": "Manajemen Stylist",
      "/dashboard/services": "Manajemen Layanan",
      "/dashboard/bookings": "Manajemen Booking",
      "/dashboard/payments": "Pembayaran",
      "/dashboard/reviews": "Ulasan & Rating",
      "/dashboard/customers": "Pelanggan",
      "/dashboard/promos": "Promo & Loyalty",
      "/dashboard/analytics": "Laporan & Analitik",
      "/dashboard/settings": "Pengaturan",
      "/dashboard/management/stylists": "Manajemen Stylist",
      "/dashboard/management/services": "Manajemen Layanan",
      "/dashboard/management/bookings": "Manajemen Booking",
    };

    return titleMap[path] || "Dashboard";
  };

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!authService.isAuthenticated() || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has dashboard access
  const hasAccess = ["ADMIN", "MANAGER", "STYLIST"].includes(user.role);
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">
            Akses Ditolak
          </h1>
          <p className="text-secondary-600">
            Anda tidak memiliki izin untuk mengakses dashboard ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex">
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${sidebarCollapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0"}
        `}
      >
        <Sidebar collapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header onMenuClick={handleMobileMenuToggle} title={getPageTitle()} />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">{children || <Outlet />}</div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-secondary-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-secondary-500">
            <div>© 2024 Rusdi Barber. All rights reserved.</div>
            <div className="flex items-center space-x-4">
              <span>Version 1.0.0</span>
              <span>•</span>
              <button className="hover:text-secondary-700">Bantuan</button>
              <span>•</span>
              <button className="hover:text-secondary-700">Kontak</button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
