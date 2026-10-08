import React, { useEffect, useRef } from 'react';
import {
  BadgeCheck,
  BarChart3,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Users,
  UsersRound,
  Clock3,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';

export const staffManagementTabs = [
  { label: 'Overview', path: '/staff-management/overview', permission: 'staff.view', icon: LayoutDashboard },
  { label: 'All Staff', path: '/staff-management/staff', permission: 'staff.view', icon: Users },
  { label: 'Roles', path: '/staff-management/roles', permission: 'company.manage', icon: ShieldCheck },
  { label: 'Teams', path: '/staff-management/teams', permission: 'staff.edit', icon: UsersRound },
  { label: 'Shifts', path: '/staff-management/shifts', permission: 'staff.edit', icon: Clock3 },
  { label: 'Performance', path: '/staff-management/performance', permission: 'staff.view', icon: BarChart3 },
  { label: 'Documents', path: '/staff-management/documents', permission: 'staff.view', icon: FileText },
  { label: 'Reports', path: '/staff-management/reports', permission: 'staff.view', icon: BadgeCheck },
];

export const StaffManagementTabs = () => {
  const tabsRef = useRef(null);
  const location = useLocation();
  const { user } = useAuth();
  const visibleTabs = staffManagementTabs.filter((tab) =>
    hasPermission(user, tab.permission),
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      tabsRef.current?.querySelector('.staff-dashboard-tab.active')?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }, 50);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <nav className="staff-dashboard-tabs" aria-label="Staff Management navigation">
      <div ref={tabsRef} className="staff-dashboard-tabs__rail">
        {visibleTabs.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `staff-dashboard-tab ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={13} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
