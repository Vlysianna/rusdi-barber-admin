import React from 'react';
import { usePermission } from '';

type Resource = 'users' | 'services' | 'stylists' | 'bookings' | 'payments' | 'reviews' | 'settings' | 'reports' | 'dashboard';
type Action = 'create' | 'read' | 'update' | 'delete';

interface PermissionGateProps {
  children: React.ReactNode;
  resource: Resource;
  action: Action;
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 * 
 * @example
 * ```tsx
 * <PermissionGate resource="services" action="create">
 *   <Button>Create Service</Button>
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  children,
  resource,
  action,
  fallback = null,
}: PermissionGateProps) {
  const { can } = usePermission();

  if (!can(resource, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RoleGateProps {
  children: React.ReactNode;
  roles: Array<'admin' | 'manager' | 'stylist' | 'customer'>;
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user role
 * 
 * @example
 * ```tsx
 * <RoleGate roles={['admin', 'manager']}>
 *   <AdminPanel />
 * </RoleGate>
 * ```
 */
export function RoleGate({ children, roles, fallback = null }: RoleGateProps) {
  const { role } = usePermission();

  if (!role || !roles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface DashboardGateProps {
  children: React.ReactNode;
  dashboardType: 'admin' | 'manager' | 'stylist';
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on dashboard access
 * 
 * @example
 * ```tsx
 * <DashboardGate dashboardType="admin">
 *   <AdminDashboard />
 * </DashboardGate>
 * ```
 */
export function DashboardGate({
  children,
  dashboardType,
  fallback = null,
}: DashboardGateProps) {
  const { canAccess } = usePermission();

  if (!canAccess(dashboardType)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
