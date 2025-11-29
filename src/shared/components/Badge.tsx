import React from 'react';
import { getStatusBadgeClass, getStatusLabel } from '../../lib/utils/helpers';

interface BadgeProps {
  status?: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ status, label, variant, size = 'md', children }) => {
  // If status provided, use old behavior for backward compatibility
  if (status) {
    return (
      <span className={getStatusBadgeClass(status)}>
        {label || getStatusLabel(status)}
      </span>
    );
  }

  // New variant-based styling
  const variantClasses = {
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-cyan-100 text-cyan-800',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const className = `inline-flex items-center font-medium rounded-full ${
    variantClasses[variant || 'primary']
  } ${sizeClasses[size]}`;

  return <span className={className}>{children || label}</span>;
};

export default Badge;
