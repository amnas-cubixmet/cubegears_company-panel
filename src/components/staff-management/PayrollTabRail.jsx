import React, { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const tabs = [
  { label: 'Overview', path: '/payroll' },
  { label: 'Employees', path: '/payroll/employees' },
  { label: 'Attendance', path: '/payroll/attendance' },
  { label: 'Salary Setup', path: '/payroll/salary-setup' },
  { label: 'Incentives', path: '/payroll/incentives' },
  { label: 'Overtime', path: '/payroll/overtime' },
  { label: 'Advances', path: '/payroll/advances' },
  { label: 'Run Payroll', path: '/payroll/run' },
  { label: 'Payslips', path: '/payroll/payslips' },
  { label: 'Reports', path: '/payroll/reports' }
];

export const PayrollTabRail = () => {
  const railRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const activeTab = railRef.current?.querySelector('.payroll-subnav-item.active');
      activeTab?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }, 60);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="payroll-tabs-shell w-full min-w-0 rounded-2xl border border-line bg-surface p-1.5 shadow-sm">
      <div
        ref={railRef}
        className="payroll-subnav flex w-full min-w-0 gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.path === '/payroll'}
            className={({ isActive }) => [
              'payroll-subnav-item inline-flex h-10 shrink-0 items-center justify-center rounded-xl px-3.5',
              'text-[12px] font-semibold leading-none no-underline transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
              isActive
                ? 'active bg-primary text-white shadow-sm'
                : 'bg-transparent text-secondary hover:bg-surface-2 hover:text-content'
            ].join(' ')}
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
};
