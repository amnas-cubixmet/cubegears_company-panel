import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

const PayrollPeriodContext = createContext();

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const YEARS = [2024, 2025, 2026, 2027];

export const PayrollPeriodProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();
  const isPayrollPage = /^\/payroll\/(?:daily-wages(?:\/history)?|payments)\/?$/.test(pathname)
    || /^\/staff\/[^/]+\/wages\/?$/.test(pathname);

  const currentMonthName = MONTHS[new Date().getMonth()] || 'September';
  const currentYearNum = new Date().getFullYear() || 2026;

  const [selectedMonth, setSelectedMonth] = useState(() => {
    return searchParams.get('month') || currentMonthName;
  });

  const [selectedYear, setSelectedYear] = useState(() => {
    return searchParams.get('year') ? Number(searchParams.get('year')) : currentYearNum;
  });

  const [selectedBranch, setSelectedBranch] = useState(() => {
    return searchParams.get('branch') || 'All';
  });

  const [selectedStaff, setSelectedStaff] = useState(() => {
    return searchParams.get('staff') || 'All';
  });

  // Sync state changes with URL query parameters so page refresh / direct links preserve filter state
  useEffect(() => {
    // Global filter writes can race <Navigate> and strand unrelated routes
    // on a blank page. Only canonical payroll pages own these query keys.
    if (!isPayrollPage) return;
    const params = new URLSearchParams(searchParams);
    if (selectedMonth) params.set('month', selectedMonth);
    if (selectedYear) params.set('year', selectedYear.toString());
    if (selectedBranch) params.set('branch', selectedBranch);
    if (selectedStaff) params.set('staff', selectedStaff);
    
    // Only update if changed to avoid loop
    if (
      searchParams.get('month') !== selectedMonth ||
      searchParams.get('year') !== selectedYear.toString() ||
      searchParams.get('branch') !== selectedBranch ||
      searchParams.get('staff') !== selectedStaff
    ) {
      setSearchParams(params, { replace: true });
    }
  }, [selectedMonth, selectedYear, selectedBranch, selectedStaff, isPayrollPage, pathname, searchParams, setSearchParams]);

  const periodString = `${selectedMonth} ${selectedYear}`;

  return (
    <PayrollPeriodContext.Provider
      value={{
        selectedMonth,
        setSelectedMonth,
        selectedYear,
        setSelectedYear,
        selectedBranch,
        setSelectedBranch,
        selectedStaff,
        setSelectedStaff,
        periodString,
        MONTHS,
        YEARS
      }}
    >
      {children}
    </PayrollPeriodContext.Provider>
  );
};

export const usePayrollPeriod = () => {
  const context = useContext(PayrollPeriodContext);
  if (!context) {
    throw new Error('usePayrollPeriod must be used within a PayrollPeriodProvider');
  }
  return context;
};
