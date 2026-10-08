import React, { useMemo } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

const months = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const monthKey = (date) => date.getFullYear() * 12 + date.getMonth();

export const AttendanceOverviewHeader = ({
  monthLabel,
  month,
  year,
  minDate,
  maxDate,
  onMonthChange,
  onYearChange,
  onPreviousMonth,
  onNextMonth,
}) => {
  const minimum = minDate instanceof Date && !Number.isNaN(minDate.getTime())
    ? minDate
    : new Date(year, month, 1);
  const maximum = maxDate instanceof Date && !Number.isNaN(maxDate.getTime())
    ? maxDate
    : new Date();

  const years = useMemo(() => {
    const firstYear = minimum.getFullYear();
    const lastYear = maximum.getFullYear();
    return Array.from(
      { length: Math.max(1, lastYear - firstYear + 1) },
      (_, index) => firstYear + index,
    );
  }, [minimum.getFullYear(), maximum.getFullYear()]);

  const availableMonths = months
    .map((name, index) => ({ name, index }))
    .filter(({ index }) => {
      const key = year * 12 + index;
      return key >= monthKey(minimum) && key <= monthKey(maximum);
    });

  const currentKey = year * 12 + month;
  const previousDisabled = currentKey <= monthKey(minimum);
  const nextDisabled = currentKey >= monthKey(maximum);

  return (
    <section className="attendance-dashboard-heading">
      <div>
        <h2>Attendance Overview</h2>
        <p>Only attendance from your joining date is available.</p>
      </div>

      <div className="attendance-month-controls">
        <button
          type="button"
          onClick={onPreviousMonth}
          aria-label="Previous month"
          disabled={previousDisabled}
        >
          <ChevronLeft size={15} />
        </button>

        <div className="attendance-month-selects">
          <CalendarDays size={14} />
          <select value={month} onChange={(event) => onMonthChange(Number(event.target.value))}>
            {availableMonths.map(({ name, index }) => (
              <option key={name} value={index}>{name}</option>
            ))}
          </select>

          <select value={year} onChange={(event) => onYearChange(Number(event.target.value))}>
            {years.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onNextMonth}
          aria-label="Next month"
          disabled={nextDisabled}
        >
          <ChevronRight size={15} />
        </button>
      </div>

      <span className="attendance-current-month-label">{monthLabel}</span>
    </section>
  );
};
