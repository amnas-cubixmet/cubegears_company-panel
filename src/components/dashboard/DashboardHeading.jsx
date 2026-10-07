import React from 'react';
import { Clock } from 'lucide-react';

export const DashboardHeading = ({ user, isClockedIn, currentTime, onClockToggle }) => (
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

      <button
        type="button"
        className={`dashboard-button duty-button ${isClockedIn ? 'is-danger' : 'is-primary'}`}
        onClick={onClockToggle}
      >
        <Clock size={14} />
        {isClockedIn ? 'Clock Out' : 'Clock In'}
      </button>
    </div>
  </section>
);
