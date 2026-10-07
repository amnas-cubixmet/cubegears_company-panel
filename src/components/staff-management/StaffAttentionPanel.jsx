import React from 'react';
import { AlertTriangle, FileWarning, UserMinus, UserX, Wrench } from 'lucide-react';

export const StaffAttentionPanel = ({
  missingDocs,
  noticePeriod,
  suspended,
  inactive,
  openAssignments,
  onOpenStaff,
  onOpenDocuments,
}) => {
  const rows = [
    { label: 'Missing Documents', value: missingDocs, icon: FileWarning },
    { label: 'Notice Period', value: noticePeriod, icon: UserMinus },
    { label: 'Suspended', value: suspended, icon: UserX },
    { label: 'Inactive / Resigned', value: inactive, icon: AlertTriangle },
    { label: 'Open Assignments', value: openAssignments, icon: Wrench },
  ];

  return (
    <article className="staff-dashboard-panel">
      <header className="staff-dashboard-panel-title">
        <div>
          <h2>Needs Attention</h2>
          <p>Staff records requiring manager follow-up.</p>
        </div>
        <AlertTriangle size={15} />
      </header>

      <div className="staff-dashboard-attention-list">
        {rows.map(({ label, value, icon: Icon }) => (
          <div key={label}>
            <span className="staff-dashboard-attention-icon"><Icon size={13} /></span>
            <strong>{label}</strong>
            <b>{value}</b>
          </div>
        ))}
      </div>

      <div className="staff-dashboard-panel-actions">
        <button type="button" className="is-primary" onClick={onOpenStaff}>Review Staff</button>
        <button type="button" onClick={onOpenDocuments}>Documents</button>
      </div>
    </article>
  );
};
