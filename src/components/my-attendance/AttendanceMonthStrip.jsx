import React from 'react';
import { statusTone } from './attendance.utils';

export const AttendanceMonthStrip = ({
  monthLabel,
  totalDays,
  startDay = 1,
  endDay,
  selectedDay,
  onSelectDay,
  logByDay,
  eventByDay,
}) => {
  const lastVisibleDay = Math.min(totalDays, endDay || totalDays);
  const firstVisibleDay = Math.max(1, startDay);
  const visibleDays = lastVisibleDay >= firstVisibleDay
    ? Array.from(
        { length: lastVisibleDay - firstVisibleDay + 1 },
        (_, index) => firstVisibleDay + index,
      )
    : [];

  return (
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
          {visibleDays.map((day) => {
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

          {!visibleDays.length && (
            <span className="attendance-days-empty">No attendance days are available for this month.</span>
          )}
        </div>
      </div>
    </section>
  );
};
