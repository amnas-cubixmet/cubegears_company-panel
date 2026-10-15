import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { getPermissionForPath } from '../utils/permissions';
import { useFeatureAccess, moduleIsVisible } from '../context/FeatureAccessContext';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const featureAccess = useFeatureAccess();
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

  if (featureAccess.loading) {
    return <div role="status" aria-live="polite" style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>Checking feature access…</div>;
  }
  const isAccountRoute = location.pathname === '/account' || location.pathname.startsWith('/account/');
  if (isAccountRoute && !featureAccess.isCompanyOwner) {
    return <Navigate to="/access-denied" replace />;
  }
  if (featureAccess.paidAccessRequired && featureAccess.modules.length === 0 &&
      !isAccountRoute && !['/profile', '/access-denied'].includes(location.pathname)) {
    return <Navigate to={featureAccess.isCompanyOwner ? '/account' : '/access-denied'} replace />;
  }
  if (featureAccess.enforced && location.pathname === '/dashboard'  && featureAccess.modules.length === 0) {
    return <Navigate to={featureAccess.canManageFeatures ? '/account/credits/features' : '/access-denied'} replace />;
  }
  const requiredPermission = getPermissionForPath(location.pathname);
  // Nested Job Card sections require BOTH the Jobs label and their own
  // Stock/Invoices label; knowing a URL must not bypass either subscription.
  const nestedJobModule = /^\/jobs\/[^/]+\/(?:invoice|parts)(?:\/|$)/.test(location.pathname);
  const missingJobAccess = nestedJobModule && !featureAccess.can('jobs.view');
  const staffProfileMatch = location.pathname.match(/^\/staff-management\/staff\/([^/]+)$/);
  const isOwnStaffProfile =
    Boolean(staffProfileMatch) &&
    Boolean(user?.employeeProfileId) &&
    String(staffProfileMatch[1]) === String(user.employeeProfileId);
  if (
    location.pathname !== '/access-denied' &&
    requiredPermission &&
    (missingJobAccess || !moduleIsVisible(featureAccess, requiredPermission) ||
      ((!isOwnStaffProfile || featureAccess.labelOnly) && !featureAccess.can(requiredPermission)))
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
