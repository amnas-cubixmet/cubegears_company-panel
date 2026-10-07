import React from 'react';
import { Building2, Clock3, UserRound } from 'lucide-react';
import { getUserRoleLabel } from '../../utils/authDisplay';

export const EmployeeAttendanceCard = ({ user }) => {
  const roleLabel = getUserRoleLabel(user, 'Workshop Staff');

  return (
    <section className="attendance-employee-card">
      <div className="attendance-employee-main">
        <div className="attendance-employee-avatar">
          {user?.avatar ? <img src={user.avatar} alt="" /> : <UserRound size={22} />}
        </div>
        <div className="attendance-employee-copy">
          <span>Employee</span>
          <h3>{user?.name || 'Workshop User'}</h3>
          <p>{roleLabel}</p>
        </div>
      </div>

      <div className="attendance-employee-meta">
        <div>
          <UserRound size={14} />
          <span>
            <small>Email</small>
            <strong>{user?.email || '—'}</strong>
          </span>
        </div>
        <div>
          <Building2 size={14} />
          <span>
            <small>Branch</small>
            <strong>{user?.branch?.name || 'Main Garage'}</strong>
          </span>
        </div>
        <div>
          <Clock3 size={14} />
          <span>
            <small>Shift</small>
            <strong>09:00 AM – 06:00 PM</strong>
          </span>
        </div>
      </div>
    </section>
  );
};
