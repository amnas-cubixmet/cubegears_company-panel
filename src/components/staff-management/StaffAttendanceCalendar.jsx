import React from 'react';
import { CalendarDays } from 'lucide-react';

const statusTone = (status = '') => {
  if (['Present'].includes(status)) return 'success';
  if (['Absent','Missing Clock Out'].includes(status)) return 'danger';
  if (['On Leave','Half Day'].includes(status)) return 'warning';
  if (['Weekly Off','Holiday'].includes(status)) return 'neutral';
  return 'empty';
};

export const StaffAttendanceCalendar = ({
  monthValue,
  onMonthChange,
  calendar,
  employee,
  onDayOpen,
}) => {
  const [year, month] = String(monthValue).split('-').map(Number);
  const days = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const dayMap = employee?.days || {};

  return (
    <div className="staff-profile-calendar">
      <header>
        <div>
          <CalendarDays size={15} />
          <div><strong>Attendance Calendar</strong><span>Month-wise attendance and exceptions.</span></div>
        </div>
        <input type="month" value={monthValue} onChange={(e) => onMonthChange(e.target.value)} />
      </header>

      <div className="staff-profile-calendar-weekdays">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day) => <span key={day}>{day}</span>)}
      </div>

      <div className="staff-profile-calendar-grid">
        {Array.from({ length: firstWeekday }).map((_, index) => <span key={'blank-'+index} className="is-blank" />)}
        {Array.from({ length: days }, (_, index) => index + 1).map((day) => {
          const entry = dayMap[String(day)] || {};
          const tone = statusTone(entry.status);
          const date = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          return (
            <button
              key={day}
              type="button"
              className={'staff-calendar-day is-' + tone}
              onClick={() => entry.status && onDayOpen?.(date)}
              disabled={!entry.status}
            >
              <span>{day}</span>
              <b>{entry.code || '—'}</b>
            </button>
          );
        })}
      </div>

      {!employee && (
        <div className="staff-profile-calendar-empty">
          No attendance data available for this employee in the selected month.
        </div>
      )}
    </div>
  );
};
