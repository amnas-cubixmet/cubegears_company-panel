import React, { useEffect, useRef } from 'react';
import { Clock3, LayoutDashboard, ShieldCheck, Users, UsersRound } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useFeatureAccess } from '../../context/FeatureAccessContext';

// Keep only the useful staff sections in the navigation. Existing direct
// routes for documents/performance/reports continue to work as before.
export const staffManagementTabs = [
  { label: 'Overview', path: '/staff-management/overview', permission: 'staff.view', icon: LayoutDashboard },
  { label: 'All Staff', path: '/staff-management/staff', permission: 'staff.view', icon: Users },
  { label: 'Roles & Permissions', path: '/staff-management/roles', permission: 'company.manage', icon: ShieldCheck },
  { label: 'Teams', path: '/staff-management/teams', permission: 'staff.edit', icon: UsersRound },
  { label: 'Shifts', path: '/staff-management/shifts', permission: 'staff.edit', icon: Clock3 },
];

export const StaffManagementTabs = () => {
  const tabsRef = useRef(null);
  const location = useLocation();
  const { can } = useFeatureAccess();
  const visibleTabs = staffManagementTabs.filter((tab) => can(tab.permission));

  useEffect(() => {
    tabsRef.current?.querySelector('.staff-dashboard-tab.active')?.scrollIntoView({
      behavior: 'auto', inline: 'nearest', block: 'nearest',
    });
  }, [location.pathname]);

  if (!visibleTabs.length) return null;

  return (
    <nav className="staff-dashboard-tabs" aria-label="Staff Management navigation">
      <div ref={tabsRef} className="staff-dashboard-tabs__rail">
        {visibleTabs.map(({ label, path, icon: Icon }) => {
          const isStaffDetail = path === '/staff-management/staff'
            && (/^\/staff-management\/staff\/[^/]+$/.test(location.pathname)
              || location.pathname === '/staff-management/add');
          return (
            <NavLink key={path} to={path}
              className={({ isActive }) => `staff-dashboard-tab ${isActive || isStaffDetail ? 'active' : ''}`}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
