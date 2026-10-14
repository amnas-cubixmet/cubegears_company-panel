import React, { useEffect, useState } from 'react';
import { subscriptionApi } from '../services/razorpayCheckout.service';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { getPermissionForPath, hasPermission } from '../utils/permissions';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const [access, setAccess] = useState(null);
  const [checkingPlan, setCheckingPlan] = useState(true);
  const [planError, setPlanError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { setCheckingPlan(false); setAccess(null); return; }
    let active = true;
    setCheckingPlan(true);
    subscriptionApi.access().then((state) => {
      if (!active) return;
      setAccess(state);
      setPlanError('');
    }).catch((error) => {
      if (!active) return;
      setAccess(null);
      setPlanError(error?.message || 'Unable to verify your subscription.');
    }).finally(() => { if (active) setCheckingPlan(false); });
    return () => { active = false; };
  }, [isAuthenticated, location.pathname]);

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

  if (checkingPlan) return <div role="status" style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>Checking subscription…</div>;

  if (planError) return (
    <div role="alert" style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', gap: 12, padding: 24 }}>
      <p>{planError}</p>
      <button type="button" onClick={() => window.location.reload()}>Retry subscription check</button>
    </div>
  );

  if (access?.enforcementEnabled && !access.allowed && location.pathname !== '/subscribe') {
    return <Navigate to="/subscribe" replace />;
  }

  // The checkout is a focused, full-page experience without the dashboard layout.
  if (location.pathname === '/subscribe') {
    return <Outlet />;
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
