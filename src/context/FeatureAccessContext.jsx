import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';
import { hasPermission } from '../utils/permissions';

// UI filtering only. Django tenant permissions and entitlements remain authoritative.
const FeatureAccessContext = createContext(null);
const LOCKED = Object.freeze({
  enforced: true, modules: [], permissions: [], canManageFeatures: false, unavailable: true, userKey: '',
});
const CORE_MODULES = new Set(['billing', 'settings', 'company', 'storage', 'notifications', 'roles']);
const userIdentity = (user) => user?.id
  ? String(user.id) + ':' + String(user.companyId || user.company?.id || '')
  : '';

export function moduleIsVisible(access, permission) {
  if (!permission) return true;
  if (!access || access.unavailable) return false;
  if (!access.enforced) return true;
  const module = permission.split('.')[0];
  // Keep billing and administration accessible without creating a paid-feature deadlock.
  if (CORE_MODULES.has(module)) return true;
  if (module === 'dashboard') return access.modules.length > 0;
  return access.modules.includes(module);
}

export function FeatureAccessProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const userKey = userIdentity(user);
  const [access, setAccess] = useState(LOCKED);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !userKey) {
      setAccess(LOCKED);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.get('/saas/credits/access');
      if (typeof response?.enforcementEnabled !== 'boolean' ||
          !Array.isArray(response?.enabledModules) || !Array.isArray(response?.permissions)) {
        throw new Error('Invalid feature access response');
      }
      const expectedCompany = user?.companyId || user?.company?.id;
      if (expectedCompany && response.companyId && String(expectedCompany) !== String(response.companyId)) {
        throw new Error('Access response belongs to a different company');
      }
      setAccess({
        userKey,
        companyId: response.companyId,
        enforced: response.enforcementEnabled,
        modules: response.enabledModules.filter(item => typeof item === 'string'),
        permissions: response.permissions.filter(item => typeof item === 'string'),
        canManageFeatures: response.canManageFeatures === true,
        unavailable: false,
      });
    } catch {
      // Offline/invalid entitlement results never unlock another tenant's modules.
      setAccess({ ...LOCKED, userKey });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userKey]);

  useEffect(() => {
    refresh();
    window.addEventListener('cubegear:credits-updated', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('cubegear:credits-updated', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);

  const current = access.userKey === userKey ? access : LOCKED;
  const checking = loading || (isAuthenticated && Boolean(userKey) && access.userKey !== userKey);
  const can = useCallback((permission) => {
    if (!permission) return true;
    if (!isAuthenticated || checking || current.unavailable || !moduleIsVisible(current, permission)) return false;
    // The server already intersects RBAC with the company's paid entitlements.
    return current.enforced
      ? current.permissions.includes(permission)
      : hasPermission(user, permission);
  }, [isAuthenticated, checking, current, user]);

  const value = useMemo(() => ({ ...current, loading: checking, refresh, can }), [current, checking, refresh, can]);
  return <FeatureAccessContext.Provider value={value}>{children}</FeatureAccessContext.Provider>;
}

export function useFeatureAccess() {
  const context = useContext(FeatureAccessContext);
  if (!context) throw new Error('useFeatureAccess must be inside FeatureAccessProvider');
  return context;
}
