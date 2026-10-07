import React from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

const months = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export const AttendanceOverviewHeader = ({
  monthLabel,
  month,
  year,
  onMonthChange,
  onYearChange,
  onPreviousMonth,
  onNextMonth,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <section className="attendance-dashboard-heading">
      <div>
        <h2>Attendance Overview</h2>
        <p>Track daily attendance, work hours and monthly activity.</p>
      </div>

      <div className="attendance-month-controls">
        <button type="button" onClick={onPreviousMonth} aria-label="Previous month">
          <ChevronLeft size={15} />
        </button>

        <div className="attendance-month-selects">
          <CalendarDays size={14} />
          <select value={month} onChange={(event) => onMonthChange(Number(event.target.value))}>
            {months.map((name, index) => (
              <option key={name} value={index}>{name}</option>
            ))}
          </select>
          <select value={year} onChange={(event) => onYearChange(Number(event.target.value))}>
            {Array.from({ length: 7 }, (_, index) => currentYear - 4 + index).map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <button type="button" onClick={onNextMonth} aria-label="Next month">
          <ChevronRight size={15} />
        </button>
      </div>

      <span className="attendance-current-month-label">{monthLabel}</span>
    </section>
  );
};
