import React from 'react';
import { Clock3, LogIn, Repeat2, TimerReset } from 'lucide-react';

const modes = [
  {
    value: 'single',
    title: 'Single Punch',
    description: 'One check-in and one check-out per day. No second session after checkout.',
    icon: LogIn,
  },
  {
    value: 'multi',
    title: 'Multi Punch',
    description: 'Employees can check in and out multiple times during the same day.',
    icon: Repeat2,
  },
  {
    value: 'auto_checkout',
    title: 'Auto Checkout',
    description: 'Employee checks in once. Manual checkout is hidden and system closes at shift end.',
    icon: Clock3,
  },
  {
    value: 'hybrid',
    title: 'Hybrid',
    description: 'One manual session per day; if checkout is missed, system auto-closes it at shift end.',
    icon: TimerReset,
  },
];

export const AttendanceModeSelector = ({ value, onChange }) => (
  <div className="attendance-mode-grid">
    {modes.map(({ value: modeValue, title, description, icon: Icon }) => {
      const selected = value === modeValue;
      return (
        <button
          key={modeValue}
          type="button"
          className={`attendance-mode-card ${selected ? 'is-selected' : ''}`}
          onClick={() => onChange(modeValue)}
        >
          <span className="attendance-mode-icon"><Icon size={17} /></span>
          <span className="attendance-mode-copy">
            <strong>{title}</strong>
            <small>{description}</small>
          </span>
          <span className="attendance-mode-radio" aria-hidden="true" />
        </button>
      );
    })}
  </div>
);
