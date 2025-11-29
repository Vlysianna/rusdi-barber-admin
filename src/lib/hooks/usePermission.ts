import { useAuth } from './useAuth';

type Role = 'admin' | 'manager' | 'stylist' | 'customer';
type Resource = 'users' | 'services' | 'stylists' | 'bookings' | 'payments' | 'reviews' | 'settings' | 'reports' | 'dashboard';
type Action = 'create' | 'read' | 'update' | 'delete';
type DashboardType = 'admin' | 'manager' | 'stylist';

/**
 * Normalize role to lowercase for comparison
 */
const normalizeRole = (role: string | undefined): Role | undefined => {
  if (!role) return undefined;
  return role.toLowerCase() as Role;
};

/**
 * Permission matrix defining what each role can do
 * Must match backend RBAC permissions
 */
const PERMISSIONS: Record<Role, Record<Resource, Action[]>> = {
  admin: {
    users: ['create', 'read', 'update', 'delete'],
    services: ['create', 'read', 'update', 'delete'],
    stylists: ['create', 'read', 'update', 'delete'],
    bookings: ['create', 'read', 'update', 'delete'],
    payments: ['create', 'read', 'update', 'delete'],
    reviews: ['create', 'read', 'update', 'delete'],
    settings: ['create', 'read', 'update', 'delete'],
    reports: ['read'],
    dashboard: ['read'],
  },
  manager: {
    users: ['create', 'read', 'update'], // Can't delete users
    services: ['create', 'read', 'update'], // Can't delete services
    stylists: ['create', 'read', 'update'], // Can't delete stylists
    bookings: ['create', 'read', 'update'], // Can't delete bookings
    payments: ['read', 'update'], // Can process refunds
    reviews: ['read'], // Can view reviews
    settings: ['read', 'update'], // Limited settings access
    reports: ['read'], // Can view reports
    dashboard: ['read'],
  },
  stylist: {
    users: [], // No user management
    services: ['read'], // Can only view services
    stylists: ['read', 'update'], // Can only update own profile
    bookings: ['read', 'update'], // Can view and manage own bookings
    payments: ['read'], // Can view own earnings
    reviews: ['read'], // Can view own reviews
    settings: [], // No settings access
    reports: [], // No reports access
    dashboard: ['read'], // Can view own dashboard
  },
  customer: {
    users: ['read', 'update'], // Can only view/update own profile
    services: ['read'], // Can view services
    stylists: ['read'], // Can view stylists
    bookings: ['create', 'read', 'update'], // Can manage own bookings
    payments: ['create', 'read'], // Can view own payments and make payments
    reviews: ['create', 'read', 'update', 'delete'], // Can manage own reviews
    settings: ['read', 'update'], // Can update own settings
    reports: [], // No reports access
    dashboard: [], // No dashboard access
  },
};

/**
 * Dashboard access levels by role
 */
const DASHBOARD_ACCESS: Record<Role, DashboardType[]> = {
  admin: ['admin', 'manager', 'stylist'],
  manager: ['manager', 'stylist'],
  stylist: ['stylist'],
  customer: [],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: Role,
  resource: Resource,
  action: Action
): boolean {
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions) return false;

  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action);
}

/**
 * Check if a role can access a specific dashboard
 */
export function canAccessDashboard(
  role: Role,
  dashboardType: DashboardType
): boolean {
  const allowedDashboards = DASHBOARD_ACCESS[role];
  return allowedDashboards.includes(dashboardType);
}

/**
 * React hook to check user permissions
 */
export function usePermission() {
  const { user } = useAuth();

  const can = (resource: Resource, action: Action): boolean => {
    if (!user || !user.role) return false;
    const normalizedRole = normalizeRole(user.role);
    if (!normalizedRole) return false;
    return hasPermission(normalizedRole, resource, action);
  };

  const canAccess = (dashboardType: DashboardType): boolean => {
    if (!user || !user.role) return false;
    const normalizedRole = normalizeRole(user.role);
    if (!normalizedRole) return false;
    return canAccessDashboard(normalizedRole, dashboardType);
  };

  const normalizedRole = normalizeRole(user?.role);
  const isAdmin = normalizedRole === 'admin';
  const isManager = normalizedRole === 'manager';
  const isStylist = normalizedRole === 'stylist';
  const isCustomer = normalizedRole === 'customer';

  return {
    can,
    canAccess,
    isAdmin,
    isManager,
    isStylist,
    isCustomer,
    role: normalizedRole,
  };
}
