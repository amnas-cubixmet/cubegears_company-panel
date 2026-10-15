import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';

// The server owns this list. It is UX filtering only: Django's RolePermission
// remains the enforcement authority for every protected API action.
const FeatureAccessContext = createContext(null);
const LOCKED = Object.freeze({ enforced: true, modules: [], canManageFeatures: false, unavailable: true });
const LEGACY = Object.freeze({ enforced: false, modules: [], canManageFeatures: false });

export function FeatureAccessProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [access, setAccess] = useState(LOCKED);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setAccess(LEGACY);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.get('/saas/credits/entitlements');
      if (typeof response?.enforced !== 'boolean' || !Array.isArray(response?.modules)) {
        throw new Error('Invalid entitlement response');
      }
      setAccess({
        enforced: response.enforced,
        modules: response.modules.filter((item) => typeof item === 'string'),
        canManageFeatures: response.canManageFeatures === true,
        unavailable: false,
      });
    } catch (error) {
      // A missing endpoint, network error or malformed entitlement response
      // must NOT reveal workshop modules in paid-feature mode.
      setAccess(LOCKED);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    refresh();
    window.addEventListener('cubegear:credits-updated', refresh);
    return () => window.removeEventListener('cubegear:credits-updated', refresh);
  }, [refresh]);

  const value = useMemo(() => ({ ...access, loading, refresh }), [access, loading, refresh]);
  return <FeatureAccessContext.Provider value={value}>{children}</FeatureAccessContext.Provider>;
}

export function useFeatureAccess() {
  const context = useContext(FeatureAccessContext);
  if (!context) throw new Error('useFeatureAccess must be inside FeatureAccessProvider');
  return context;
}

const alwaysAvailable = new Set(['billing', 'settings', 'company', 'storage', 'notifications', 'roles']);
export function moduleIsVisible(access, permission) {
  if (!access?.enforced || !permission) return true;
  const module = permission.split('.')[0];
  if (module === 'dashboard') return access.modules.length > 0;
  if (alwaysAvailable.has(module)) return true;
  return access.modules.includes(module);
}
