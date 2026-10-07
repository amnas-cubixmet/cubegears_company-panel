import React from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

export const AttendanceOverviewHeader = ({
  monthLabel,
  onPreviousMonth,
  onNextMonth,
}) => (
  <section className="attendance-dashboard-heading">
    <div>
      <h2>Attendance Overview</h2>
      <p>Track daily attendance, work hours and monthly activity.</p>
    </div>

    <div className="attendance-month-controls">
      <button type="button" onClick={onPreviousMonth} aria-label="Previous month">
        <ChevronLeft size={15} />
      </button>
      <div className="attendance-month-label">
        <CalendarDays size={14} />
        <span>{monthLabel}</span>
      </div>
      <button type="button" onClick={onNextMonth} aria-label="Next month">
        <ChevronRight size={15} />
      </button>
    </div>
  </section>
);
