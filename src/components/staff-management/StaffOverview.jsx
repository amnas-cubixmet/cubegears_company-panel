import React from 'react';
import { Plus, UsersRound } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';
import { useNavigate } from 'react-router-dom';
import { StaffAssignmentsPanel } from './StaffAssignmentsPanel';
import { StaffAttentionPanel } from './StaffAttentionPanel';
import { StaffDepartmentPanel } from './StaffDepartmentPanel';
import { StaffOverviewStats } from './StaffOverviewStats';
import { StaffQuickActions } from './StaffQuickActions';

export const StaffOverview = ({
  overview,
  staff,
  teams,
  activeStaff,
  assignments,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const missingDocs = activeStaff.filter((item) => !item.documents?.length).length;

  return (
    <div className="staff-dashboard-overview">
      <section className="staff-overview-commandbar">
        <div>
          <UsersRound size={15} />
          <span>Manage workshop employees, access, attendance and assignments.</span>
        </div>
        {hasPermission(user, 'staff.create') && (
          <button type="button" onClick={() => navigate('/staff-management/add')}>
            <Plus size={13} />
            Add Staff
          </button>
        )}
      </section>

      <StaffOverviewStats overview={overview} />

      <section className="staff-dashboard-bottom-grid">
        <StaffDepartmentPanel teams={teams} staff={staff} />

        <StaffAttentionPanel
          missingDocs={missingDocs}
          noticePeriod={staff.filter((item) => item.employmentStatus === 'Notice Period').length}
          suspended={staff.filter((item) => item.employmentStatus === 'Suspended').length}
          inactive={overview.inactive}
          openAssignments={assignments.length}
          onOpenStaff={() => navigate('/staff-management/staff')}
          onOpenDocuments={() => navigate('/staff-management/documents')}
        />

        <StaffQuickActions onNavigate={navigate} />
      </section>

      <StaffAssignmentsPanel assignments={assignments} staff={staff} />
    </div>
  );
};
