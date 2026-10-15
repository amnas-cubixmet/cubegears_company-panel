import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { getPermissionForPath } from '../utils/permissions';
import { useFeatureAccess } from '../context/FeatureAccessContext';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const { access, loading: accessLoading, error: accessError, reload, can, anyPaidModule } = useFeatureAccess();
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

  if (accessLoading) {
    return <div role="status" aria-live="polite" style={{minHeight:'100dvh',display:'grid',placeItems:'center'}}>Checking workshop feature access…</div>;
  }

  if (accessError || !access) {
    return <main role="alert" style={{padding:32}}>
      <h2>Feature access unavailable</h2>
      <p>{accessError || 'Could not confirm active company permissions.'}</p>
      <button type="button" onClick={reload}>Retry</button>
    </main>;
  }

  // No paid workshop modules: show activation controls instead of an empty
  // data dashboard. Staff without billing authority see a safe read-only notice.
  if (location.pathname === '/dashboard' && !anyPaidModule && access.enforcementEnabled) {
    return <DashboardLayout><section role="status" style={{padding:32,maxWidth:720}}>
      <h1>Activate your workshop features</h1>
      <p>No paid modules are currently available for this account. Workshop data is hidden until a company administrator activates a feature.</p>
      {access.canManageFeatures
        ? <a href="/account/credits/features">Open Feature Controls</a>
        : <p>Contact your company administrator to activate access.</p>}
    </section></DashboardLayout>;
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
    !can(requiredPermission)
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
