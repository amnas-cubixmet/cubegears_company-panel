import React from 'react';
import { Building2 } from 'lucide-react';

export const StaffDepartmentPanel = ({ teams, staff }) => (
  <article className="staff-dashboard-panel">
    <header className="staff-dashboard-panel-title">
      <div>
        <h2>Department / Team</h2>
        <p>Current workshop staff distribution.</p>
      </div>
      <Building2 size={15} />
    </header>

    <div className="staff-dashboard-team-list">
      {teams.slice(0, 6).map((team) => {
        const members = staff.filter((item) => item.department === team.name);
        return (
          <div key={team.id}>
            <span>
              <strong>{team.name}</strong>
              <small>{team.lead || 'No lead assigned'}</small>
            </span>
            <b>{members.length}</b>
          </div>
        );
      })}

      {!teams.length && (
        <div className="staff-dashboard-empty">No teams configured.</div>
      )}
    </div>
  </article>
);
