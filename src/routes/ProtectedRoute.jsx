import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { getPermissionForPath, hasPermission } from '../utils/permissions';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const [billing, setBilling] = useState(null);
  const [billingError, setBillingError] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || loading) return;
    let cancelled = false;
    setBilling(null);
    apiClient.get('/saas/payments/access').then((data) => {
      if (!cancelled) { setBilling(data); setBillingError(false); }
    }).catch(() => {
      if (!cancelled) setBillingError(true);
    });
    return () => { cancelled = true; };
  }, [isAuthenticated, loading, user?.id]);

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

  if (billingError) {
    return <div role="alert" style={{ padding: 40 }}>Cannot verify subscription access. Please check your connection and reload.</div>;
  }
  if (!billing) {
    return <div role="status" style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>Checking subscription…</div>;
  }
  if (billing.required && !billing.paid) {
    return <Navigate to="/plans" replace />;
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
