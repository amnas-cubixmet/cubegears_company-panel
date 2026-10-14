import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { USE_MOCK_API } from '../api/apiConfig';

export const CompanyContext = createContext(null);

// Never use demo company identity for authenticated production tenants.
const DEMO_COMPANY = {
  id: 'CMP_99',
  name: 'CubixGear Motors Inc.',
  logo: '/images/logo/logo.png',
  currency: '$',
  plan: 'Enterprise SaaS'
};

export const CompanyProvider = ({ children }) => {
  const { user } = useAuth();
  const authenticatedCompany = USE_MOCK_API ? DEMO_COMPANY : (user?.company || null);
  const [localCompany, setLocalCompany] = useState(null);

  const company =
    authenticatedCompany?.id && localCompany?.id === authenticatedCompany.id
      ? localCompany
      : authenticatedCompany;

  useEffect(() => {
    setLocalCompany(null);
  }, [authenticatedCompany?.id]);

  // UI edits may update display data, never change the signed-in company ID.
  const setCompany = useCallback((next) => {
    setLocalCompany((previous) => {
      const current = previous?.id === authenticatedCompany?.id
        ? previous
        : authenticatedCompany;
      const value = typeof next === 'function' ? next(current) : next;
      return authenticatedCompany?.id && value?.id === authenticatedCompany.id
        ? value
        : null;
    });
  }, [authenticatedCompany]);

  return (
    <CompanyContext.Provider value={{ company, setCompany }}>
      {children}
    </CompanyContext.Provider>
  );
};
