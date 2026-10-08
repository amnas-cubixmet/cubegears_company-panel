import React from 'react';
import { UsersRound } from 'lucide-react';

export const StaffManagementHeader = () => (
  <header className="staff-dashboard-header">
    <div>
      <h1>Staff Management</h1>
      <p>Manage workshop staff, teams, shifts, performance, documents and access.</p>
    </div>

    <div className="staff-dashboard-header-badge">
      <UsersRound size={13} />
      <span>Workshop Team</span>
    </div>
  </header>
);
