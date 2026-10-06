import React, { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';

const tabs = [
  { label: 'Overview', path: '/staff-management/overview', permission: 'staff.view' },
  { label: 'All Staff', path: '/staff-management/staff', permission: 'staff.view' },
  { label: 'Roles & Permissions', path: '/staff-management/roles', permission: 'company.manage' },
  { label: 'Teams', path: '/staff-management/teams', permission: 'staff.edit' },
  { label: 'Shifts', path: '/staff-management/shifts', permission: 'staff.edit' },
  { label: 'Skills', path: '/staff-management/skills', permission: 'staff.edit' },
  { label: 'Performance', path: '/staff-management/performance', permission: 'staff.view' },
  { label: 'Documents', path: '/staff-management/documents', permission: 'staff.view' },
  { label: 'Staff Reports', path: '/staff-management/reports', permission: 'staff.view' }
];

export const StaffManagementTabs = () => {
  const tabsRef = useRef(null);
  const location = useLocation();
  const { user } = useAuth();
  const visibleTabs = tabs.filter((tab) => hasPermission(user, tab.permission));

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
    <div className="staff-management-tabs w-full min-w-0 rounded-2xl border border-line bg-surface p-1.5 shadow-sm">
      <div ref={tabsRef} className="staff-management-tabs__rail scroll-hidden flex w-full min-w-0 gap-1.5 overflow-x-auto">
        {visibleTabs.map((tab) => (
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
