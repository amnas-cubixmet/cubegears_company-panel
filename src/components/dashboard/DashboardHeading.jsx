import React from 'react';
import { Clock } from 'lucide-react';

const modeLabel = {
  single: 'Single Punch',
  multi: 'Multi Punch',
  auto_checkout: 'Auto Checkout',
  hybrid: 'Hybrid',
};

const formatAutoCheckout = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const DashboardHeading = ({ user, attendance, currentTime, onClockToggle }) => {
  const isClockedIn = attendance?.status === 'CLOCKED_IN';
  const nextAction = attendance?.nextAction;
  const autoCheckoutTime = formatAutoCheckout(attendance?.autoCheckoutAt);

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
          {attendance?.attendanceMode && (
            <>
              <span className="duty-separator">·</span>
              <span>{modeLabel[attendance.attendanceMode] || attendance.attendanceMode}</span>
            </>
          )}
        </div>

        {nextAction ? (
          <button
            type="button"
            className={`dashboard-button duty-button ${nextAction === 'check_out' ? 'is-danger' : 'is-primary'}`}
            onClick={() => onClockToggle(nextAction)}
          >
            <Clock size={14} />
            {nextAction === 'check_out' ? 'Check Out' : 'Check In'}
          </button>
        ) : isClockedIn && attendance?.attendanceMode === 'auto_checkout' ? (
          <div className="duty-auto-message">
            <Clock size={13} />
            <span>Auto checkout{autoCheckoutTime ? ` at ${autoCheckoutTime}` : ''}</span>
          </div>
        ) : (
          <div className="duty-auto-message is-muted">
            <Clock size={13} />
            <span>{attendance?.reason || 'Attendance completed'}</span>
          </div>
        )}
      </div>
    </section>
  );
};
