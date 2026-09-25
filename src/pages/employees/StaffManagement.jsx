import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StaffManagementTabs } from '../../components/staff-management/StaffManagementTabs';
import { Staff } from '../staff-management/Staff';
import { UserRoles } from '../staff-management/UserRoles';
import { WorkshopStaffSection } from '../staff-management/WorkshopStaffSection';
import { StaffAddPage } from '../staff-management/StaffAddPage';

const resolveSection = (pathname) => {
  if (pathname.endsWith('/overview')) return 'overview';
  if (pathname.endsWith('/staff')) return 'staff';
  if (pathname.endsWith('/add')) return 'add';
  if (pathname.endsWith('/roles')) return 'roles';
  if (pathname.endsWith('/teams')) return 'teams';
  if (pathname.endsWith('/shifts')) return 'shifts';
  if (pathname.endsWith('/skills')) return 'skills';
  if (pathname.endsWith('/performance')) return 'performance';
  if (pathname.endsWith('/documents')) return 'documents';
  if (pathname.endsWith('/reports')) return 'reports';
  return 'overview';
};

export const StaffManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeSection = resolveSection(location.pathname);

  useEffect(() => {
    if (
      location.pathname === '/staff-management' ||
      location.pathname === '/staff' ||
      location.pathname === '/staff/'
    ) {
      navigate('/staff-management/overview', { replace: true });
    }
  }, [location.pathname, navigate]);

  const renderSection = () => {
    if (activeSection === 'staff') return <Staff />;
    if (activeSection === 'add') return <StaffAddPage />;
    if (activeSection === 'roles') return <UserRoles />;
    return <WorkshopStaffSection section={activeSection} />;
  };

  return (
    <div className="staff-management-page cg-staff-management flex w-full min-w-0 flex-col gap-4">
      <header className="staff-management-header">
        <h1 className="m-0 text-[22px] font-extrabold leading-tight text-content">
          Staff Management
        </h1>
        <p className="mt-1 text-[13px] leading-5 text-muted">
          Workshop staff, teams, shifts, skills, job assignment, performance, documents and access control.
        </p>
      </header>

      <StaffManagementTabs />

      <div className="staff-management-content w-full min-w-0">
        {renderSection()}
      </div>
    </div>
  );
};
