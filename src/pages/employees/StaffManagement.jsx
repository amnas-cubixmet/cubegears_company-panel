import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StaffManagementTabs } from '../../components/staff-management/StaffManagementTabs';
import { Staff } from '../staff-management/Staff';
import { UserRoles } from '../staff-management/UserRoles';

export const StaffManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const activeSubmenu = location.pathname.includes('/roles') ? 'roles' : 'staff';

  useEffect(() => {
    if (
      location.pathname === '/staff-management' ||
      location.pathname === '/staff' ||
      location.pathname === '/staff/'
    ) {
      navigate('/staff-management/staff', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="staff-management-page cg-staff-management flex w-full min-w-0 flex-col gap-4">
      <header className="staff-management-header">
        <h1 className="m-0 text-[22px] font-extrabold leading-tight text-content">
          Staff Management
        </h1>
        <p className="mt-1 text-[13px] leading-5 text-muted">
          Manage staff profiles, workshop roles, employment details and permission access.
        </p>
      </header>

      <StaffManagementTabs />

      <div className="staff-management-content w-full min-w-0">
        {activeSubmenu === 'staff' ? <Staff /> : <UserRoles />}
      </div>
    </div>
  );
};
