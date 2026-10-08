import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { getPermissionForPath, hasPermission } from '../utils/permissions';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          background: 'var(--app-bg, #0f172a)',
          color: 'var(--text-primary, #f8fafc)',
          fontSize: '14px'
        }}
      >
        Loading CubixGear…
      </div>
    );
  }

  if (!isAuthenticated) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  const requiredPermission = getPermissionForPath(location.pathname);
  const staffProfileMatch = location.pathname.match(/^\/staff-management\/staff\/([^/]+)$/);
  const isOwnStaffProfile =
    Boolean(staffProfileMatch) &&
    Boolean(user?.employeeProfileId) &&
    String(staffProfileMatch[1]) === String(user.employeeProfileId);
  if (
    location.pathname !== '/access-denied' &&
    requiredPermission &&
    !isOwnStaffProfile &&
    !hasPermission(user, requiredPermission)
  ) {
    return (
      <Navigate
        to={`/access-denied?permission=${encodeURIComponent(requiredPermission)}`}
        replace
      />
    );
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};
