import React from 'react';
import { statusTone } from './attendance.utils';

export const AttendanceMonthStrip = ({
  monthLabel,
  totalDays,
  selectedDay,
  onSelectDay,
  logByDay,
  eventByDay,
}) => (
  <section className="attendance-dashboard-card">
    <header className="attendance-card-header">
      <div>
        <h3>Attendance Calendar</h3>
        <p>{monthLabel}</p>
      </div>

      <div className="attendance-legend">
        <span><i className="dot present" />Present</span>
        <span><i className="dot late" />Late / Issue</span>
        <span><i className="dot leave" />Leave</span>
        <span><i className="dot holiday" />Holiday</span>
        <span><i className="dot off" />Weekly Off</span>
      </div>
    </header>

    <div className="attendance-days-scroll">
      <div className="attendance-days-row">
        {Array.from({ length: totalDays }, (_, index) => index + 1).map((day) => {
          const log = logByDay.get(day);
          const event = eventByDay.get(day);
          const tone = log
            ? statusTone(log.status)
            : event
              ? statusTone(event.status || event.type)
              : 'neutral';

          return (
            <button
              key={day}
              type="button"
              className={`attendance-day-chip ${tone} ${selectedDay === day ? 'selected' : ''}`}
              onClick={() => onSelectDay(day)}
              title={log?.status || event?.title || 'No record'}
            >
              <span>{String(day).padStart(2, '0')}</span>
              <i />
            </button>
          );
        })}
      </div>
    </div>
  </section>
);
