import { createContext, useCallback, useMemo, useState } from "react";
import { useAuth } from '../hooks/useAuth';

export const CompanyContext = createContext(null);

export const CompanyProvider = ({ children }) => {
  // The authenticated Django profile is the source of company identity.
  // Never render a shared demo company in a real user's workshop session.
  const { user } = useAuth();
  const source = user?.company;
  const [override, setOverride] = useState(null);

  const company = useMemo(() => {
    if (!source?.id) return null;
    return {
      ...source,
      ...(override?.id === String(source.id) ? override.changes : {}),
      id: source.id,
    };
  }, [source, override]);

  const setCompany = useCallback((update) => {
    if (!source?.id) return;
    setOverride((previous) => {
      const prior = previous?.id === String(source.id) ? previous.changes : {};
      const value = typeof update === 'function' ? update({ ...source, ...prior }) : update;
      if (!value || typeof value !== 'object' || Array.isArray(value)) return previous;
      const { id: _ignoredId, ...changes } = value;
      return { id: String(source.id), changes };
    });
  }, [source]);

  return (
    <CompanyContext.Provider value={{ company, setCompany }}>
      {children}
    </CompanyContext.Provider>
  );
};
