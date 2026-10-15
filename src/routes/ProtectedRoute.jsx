import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SaaSAccountLayout, WorkspaceAccessNotice } from '../components/layout/SaaSAccountLayout';
import { isAccountPath, isAccountOnly, setupRedirect } from '../utils/accountWorkspace';
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
  if (featureAccess.unavailable) return <WorkspaceAccessNotice unavailable onRetry={featureAccess.refresh} />;
  const isAccountRoute = isAccountPath(location.pathname);
  const setupTarget = setupRedirect(featureAccess, location.pathname);
  if (setupTarget) return <Navigate to={setupTarget} replace />;
  if (isAccountOnly(featureAccess) && !featureAccess.isCompanyOwner) {
    return <WorkspaceAccessNotice onRetry={featureAccess.refresh} />;
  }
  if (isAccountRoute && !featureAccess.isCompanyOwner) {
    return <Navigate to="/access-denied" replace />;
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

  if (isAccountRoute) return <SaaSAccountLayout><Outlet /></SaaSAccountLayout>;

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};
