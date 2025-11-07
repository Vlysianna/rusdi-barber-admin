import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Scissors,
  Calendar,
  CreditCard,
  Star,
  Gift,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { authService } from "../../services/authService";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  roles?: string[];
}

const navigationItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "MANAGER", "STYLIST"],
  },
  {
    name: "Manajemen Stylist",
    href: "/dashboard/management/stylists",
    icon: Users,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    name: "Manajemen Layanan",
    href: "/dashboard/management/services",
    icon: Scissors,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    name: "Manajemen Booking",
    href: "/dashboard/management/bookings",
    icon: Calendar,
    roles: ["ADMIN", "MANAGER", "STYLIST"],
  },
  {
    name: "Pembayaran",
    href: "/dashboard/payments",
    icon: CreditCard,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    name: "Ulasan & Rating",
    href: "/dashboard/reviews",
    icon: Star,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    name: "Pelanggan",
    href: "/dashboard/customers",
    icon: Users,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    name: "Promo & Loyalty",
    href: "/dashboard/promos",
    icon: Gift,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    name: "Laporan & Analitik",
    href: "/dashboard/analytics",
    icon: BarChart3,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    name: "Pengaturan",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["ADMIN", "MANAGER"],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const user = authService.getUser();

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout on client side even if server call fails
      window.location.href = "/login";
    }
  };

  const hasAccess = (item: NavItem): boolean => {
    if (!item.roles || !user) return true;
    return item.roles.includes(user.role);
  };

  const filteredNavItems = navigationItems.filter(hasAccess);

  return (
    <div
      className={`
        bg-white border-r border-secondary-200 flex flex-col transition-all duration-300 ease-in-out
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-secondary-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-secondary-900">
              Rusdi Barber
            </span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-secondary-100 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-secondary-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-secondary-600" />
          )}
        </button>
      </div>

      {/* User Info */}
      {user && (
        <div
          className={`p-4 border-b border-secondary-200 ${collapsed ? "px-2" : ""}`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-primary-600" />
              )}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900 truncate">
                  {user.fullName}
                </p>
                <p className="text-xs text-secondary-500 truncate">
                  {user.role.toLowerCase()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.href ||
            (item.href !== "/dashboard" &&
              location.pathname.startsWith(item.href));

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive: navIsActive }) => `
                group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150
                ${
                  isActive || navIsActive
                    ? "bg-primary-100 text-primary-700 border-r-2 border-primary-600"
                    : "text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900"
                }
                ${collapsed ? "justify-center" : ""}
              `}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={`
                  flex-shrink-0 w-5 h-5
                  ${collapsed ? "" : "mr-3"}
                  ${
                    isActive
                      ? "text-primary-600"
                      : "text-secondary-500 group-hover:text-secondary-700"
                  }
                `}
              />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-secondary-200 p-4">
        <button
          onClick={handleLogout}
          className={`
            group flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md
            hover:bg-red-50 transition-colors duration-150
            ${collapsed ? "justify-center" : ""}
          `}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut
            className={`
              flex-shrink-0 w-5 h-5
              ${collapsed ? "" : "mr-3"}
            `}
          />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
