import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Users,
  CreditCard,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';
import { useAuth } from '../lib/hooks/useAuth';
import { usePermission } from '../lib/hooks/usePermission';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { can, isAdmin, isManager, isStylist } = usePermission();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Navigation items with permission requirements
  const allNavigationItems = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: LayoutDashboard,
      show: isAdmin || isManager || isStylist // All staff can see dashboard
    },
    { 
      name: 'Booking', 
      href: '/bookings', 
      icon: Calendar,
      show: can('bookings', 'read') // Admin, Manager, Stylist
    },
    { 
      name: 'Layanan', 
      href: '/services', 
      icon: Scissors,
      show: can('services', 'read') // All roles can view services
    },
    { 
      name: 'Stylist', 
      href: '/stylists', 
      icon: User,
      show: can('stylists', 'read') // All roles can view stylists
    },
    { 
      name: 'Pembayaran', 
      href: '/payments', 
      icon: CreditCard,
      show: can('payments', 'read') // Admin, Manager, Stylist (own)
    },
    { 
      name: 'Pelanggan', 
      href: '/customers', 
      icon: Users,
      show: can('users', 'read') && (isAdmin || isManager) // Admin, Manager only
    },
    { 
      name: 'Ulasan', 
      href: '/reviews', 
      icon: Star,
      show: can('reviews', 'read') // Admin, Manager, Stylist (own)
    },
    { 
      name: 'Pengaturan', 
      href: '/settings', 
      icon: Settings,
      show: can('settings', 'read') // All roles (own settings)
    },
  ];

  // Filter navigation items based on permissions
  const navigation = allNavigationItems.filter(item => item.show);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
          transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Rusdi Barber</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.fullName}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  {user?.role && (
                    <span className={`
                      inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                      ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : ''}
                      ${user.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' : ''}
                      ${user.role === 'STYLIST' ? 'bg-green-100 text-green-800' : ''}
                      ${user.role === 'CUSTOMER' ? 'bg-gray-100 text-gray-800' : ''}
                    `}>
                      {user.role === 'ADMIN' && 'Admin'}
                      {user.role === 'MANAGER' && 'Manager'}
                      {user.role === 'STYLIST' && 'Stylist'}
                      {user.role === 'CUSTOMER' && 'Customer'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-4 ml-auto">
              <span className="text-sm text-gray-600">
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
