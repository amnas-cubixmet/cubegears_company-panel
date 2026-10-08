import React from 'react';
import {
  Building2,
  CalendarDays,
  Eye,
  Power,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { StaffAvatar } from './StaffAvatar';
import { getEmployeeLabel } from './staffDisplay';

const tone = (status = '') => {
  if (status === 'Active') return 'success';
  if (['Probation', 'Notice Period'].includes(status)) return 'warning';
  return 'danger';
};

export const StaffDirectoryCard = ({
  staff,
  index,
  onOpen,
  onToggleStatus,
}) => (
  <article className="staff-directory-card" onClick={onOpen}>
    <header className="staff-directory-card__head">
      <div className="staff-directory-person">
        <StaffAvatar staff={staff} size="md" />
        <div>
          <strong>{staff.name}</strong>
          <span>{getEmployeeLabel(staff, index)} · {staff.designation || 'Staff'}</span>
        </div>
      </div>

      <span className={`staff-directory-status is-${tone(staff.employmentStatus)}`}>
        {staff.employmentStatus || 'Active'}
      </span>
    </header>

    <div className="staff-directory-details">
      <span><Building2 size={13} />{staff.branch || 'No branch'}</span>
      <span><UserRound size={13} />{staff.department || 'Workshop'} · {staff.role || 'No role'}</span>
      <span><ShieldCheck size={13} />{staff.shift || 'No shift assigned'}</span>
      <span><CalendarDays size={13} />Joined {staff.joiningDate || '—'}</span>
    </div>

    {!!staff.skills?.length && (
      <div className="staff-directory-skills">
        {staff.skills.slice(0, 3).map((skill) => (
          <span key={typeof skill === 'string' ? skill : skill.id}>
            {typeof skill === 'string' ? skill : skill.name}
          </span>
        ))}
        {staff.skills.length > 3 && <span>+{staff.skills.length - 3}</span>}
      </div>
    )}

    <footer className="staff-directory-card__actions">
      <button
        type="button"
        className="staff-view-button"
        onClick={(event) => {
          event.stopPropagation();
          onOpen();
        }}
      >
        <Eye size={13} />
        View Profile
      </button>

      <button
        type="button"
        className={`staff-status-button ${staff.accountStatus === 'Active' ? 'is-danger' : 'is-success'}`}
        title={staff.accountStatus === 'Active' ? 'Deactivate Staff' : 'Activate Staff'}
        onClick={(event) => {
          event.stopPropagation();
          onToggleStatus();
        }}
      >
        <Power size={13} />
      </button>
    </footer>
  </article>
);
