import React, { createContext, useState } from 'react';

export const CompanyContext = createContext(null);

export const CompanyProvider = ({ children }) => {
  const [company, setCompany] = useState({
    id: 'CMP_99',
    name: 'CubixGear Motors Inc.',
    logo: '/images/logo/logo.png',
    currency: '$',
    plan: 'Enterprise SaaS'
  });

  return (
    <CompanyContext.Provider value={{ company, setCompany }}>
      {children}
    </CompanyContext.Provider>
  );
};
