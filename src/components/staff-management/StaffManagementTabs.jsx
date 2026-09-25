import React, { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const tabs = [
  { label: 'Staff', path: '/staff-management/staff' },
  { label: 'User Roles', path: '/staff-management/roles' }
];

export const StaffManagementTabs = () => {
  const tabsRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      tabsRef.current?.querySelector('.staff-tab.active')?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }, 50);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="w-full min-w-0 rounded-2xl border border-line bg-surface p-1.5 shadow-sm">
      <div ref={tabsRef} className="scroll-hidden flex w-full min-w-0 gap-1.5 overflow-x-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) => [
              'staff-tab inline-flex h-10 shrink-0 items-center justify-center rounded-xl px-3.5',
              'text-[12px] font-semibold no-underline transition-all duration-150',
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
