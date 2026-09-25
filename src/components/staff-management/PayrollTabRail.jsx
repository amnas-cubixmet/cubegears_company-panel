import React, { useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export const PayrollTabRail = () => {
  const railRef = useRef(null);
  const location = useLocation();

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

  useEffect(() => {
    // Smooth scroll the active tab to the center when location/route changes
    const timer = setTimeout(() => {
      if (railRef.current) {
        const activeTab = railRef.current.querySelector('.payroll-subnav-item.active');
        if (activeTab) {
          activeTab.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="w-full border-b border-line bg-surface">
      <div
        ref={railRef}
        className="payroll-subnav flex w-full gap-1 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((t, idx) => (
          <NavLink
            key={idx}
            to={t.path}
            end={t.path === '/payroll'}
            className={({ isActive }) => `payroll-subnav-item ${isActive ? 'active' : ''}`}
            className={({ isActive }) => [
              'payroll-subnav-item inline-flex min-h-10 shrink-0 items-center border-b-2 px-3 text-[12px] no-underline transition',
              isActive
                ? 'active border-primary font-bold text-primary'
                : 'border-transparent font-medium text-secondary hover:text-content'
            ].join(' ')}
          >
            {t.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
};
