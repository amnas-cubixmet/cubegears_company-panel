import React from 'react';
import { Clock, LogIn, LogOut } from 'lucide-react';

const formatAutoTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const DashboardHeading = ({
  user,
  attendance,
  currentTime,
  onAttendanceAction,
  error,
}) => {
  const isClockedIn = attendance?.status === 'CLOCKED_IN';
  const nextAction = attendance?.nextAction;
  const autoCheckoutTime = formatAutoTime(attendance?.autoCheckoutAt);
  const ActionIcon = nextAction === 'check_out' ? LogOut : LogIn;

  return (
    <section className="dashboard-heading">
      <div className="dashboard-heading-copy">
        <h1>Dashboard</h1>
        <p>Workshop operations, live repairs and business status.</p>
      </div>

      <div className="duty-controls">
        <div className="duty-status">
          <span className={`duty-dot ${isClockedIn ? 'is-online' : 'is-offline'}`} />
          <strong>{user?.name || 'User'}</strong>
          <span>{isClockedIn ? 'Working' : 'Off duty'}</span>
          <span className="duty-separator">·</span>
          <span>{currentTime}</span>
        </div>

        {nextAction ? (
          <button
            type="button"
            className={`dashboard-button duty-button ${nextAction === 'check_out' ? 'is-danger' : 'is-primary'}`}
            onClick={() => onAttendanceAction(nextAction)}
          >
            <ActionIcon size={14} />
            {nextAction === 'check_out' ? 'Check Out' : 'Check In'}
          </button>
        ) : (
          <div className="dashboard-attendance-rule-note">
            <Clock size={13} />
            <span>
              {autoCheckoutTime
                ? `Auto checkout at ${autoCheckoutTime}`
                : attendance?.reason || 'Attendance completed for today'}
            </span>
          </div>
        )}
      </div>
      {error && <div className="dashboard-attendance-error">{error}</div>}
    </section>
  );
};
