import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/apiClient';

const FeatureAccessContext = createContext(null);

export const hasServerAccess = (access, permission) =>
  !permission || Boolean(access?.permissions?.includes(permission));

export const FeatureAccessProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setAccess(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiClient.get('/saas/credits/access');
      if (!data || !Array.isArray(data.permissions) || !Array.isArray(data.enabledModules)) {
        throw new Error('Invalid feature access response');
      }
      setAccess(data);
      setError('');
    } catch {
      // Never fall back to an editable client-side role or cached allow-all
      // when the entitlement lookup is unavailable.
      setAccess(null);
      setError('Unable to verify active workshop features. Please retry.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, user?.companyId]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const update = () => reload();
    window.addEventListener('cubegear:credits-updated', update);
    window.addEventListener('focus', update);
    return () => {
      window.removeEventListener('cubegear:credits-updated', update);
      window.removeEventListener('focus', update);
    };
  }, [isAuthenticated, reload]);

  const value = useMemo(() => ({
    access, loading, error, reload,
    can: (permission) => hasServerAccess(access, permission),
    hasModule: (module) => Boolean(access?.enabledModules?.includes(module)),
    anyPaidModule: Boolean(access?.enabledModules?.length),
  }), [access, loading, error, reload]);

  return <FeatureAccessContext.Provider value={value}>{children}</FeatureAccessContext.Provider>;
};

export const useFeatureAccess = () => {
  const context = useContext(FeatureAccessContext);
  if (!context) throw new Error('useFeatureAccess must be used inside FeatureAccessProvider');
  return context;
};
