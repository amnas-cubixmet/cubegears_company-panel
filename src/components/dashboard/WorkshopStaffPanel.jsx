import React from 'react';
import { UserRound } from 'lucide-react';

export const WorkshopStaffPanel = ({ staff }) => (
  <article className="dashboard-panel">
    <div className="panel-title"><h2>Workshop Staff</h2><UserRound size={15} /></div>
    <div className="staff-list">
      {(staff || []).slice(0, 3).map((member) => (
        <div key={member.name} className="staff-row">
          <span className="staff-avatar"><UserRound size={13} /></span>
          <span className="staff-copy">
            <strong>{member.name}</strong>
            <small>{member.role} · {member.activeJobs} jobs</small>
          </span>
          <span className={`staff-dot ${member.status === 'Active Duty' ? 'is-online' : 'is-away'}`} />
        </div>
      ))}
    </div>
  </article>
);
