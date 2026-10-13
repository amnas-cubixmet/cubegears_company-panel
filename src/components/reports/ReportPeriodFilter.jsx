import React from 'react';
import { CalendarDays, GitBranch, RotateCcw, Users } from 'lucide-react';
import { MONTHS } from '../../pages/reports/reportAnalytics';

export const ReportPeriodFilter = ({
  month, year, branch, staff, from, to, scopeOptions,
  onMonth, onYear, onBranch, onStaff, onFrom, onTo, onThisMonth, onAllTime,
  isAllTime, dateError,
}) => {
  const current = new Date().getFullYear();
  const years = [...new Set([Number(year), current - 2, current - 1, current, current + 1])]
    .filter((number) => Number.isInteger(number) && number >= 2000 && number <= 2100)
    .sort((a, b) => b - a);

  return <section className="reports-dashboard-filter no-print" aria-label="Report filters">
    <div className="reports-filter-main">
      <label><span>Month</span>
        <select aria-label="Report month" value={month} onChange={(e) => onMonth(e.target.value)}>
          <option value="">Custom / All</option>
          {MONTHS.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
      </label>
      <label><span>Year</span>
        <select aria-label="Report year" value={year} onChange={(e) => onYear(e.target.value)}>
          {years.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <label><GitBranch size={15} aria-hidden="true"/><span>Branch</span>
        <select aria-label="Report branch" value={branch} onChange={(e) => onBranch(e.target.value)}>
          {(scopeOptions.branches.includes(branch)
            ? scopeOptions.branches : [...scopeOptions.branches, branch]).map((value) =>
            <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <label><Users size={15} aria-hidden="true"/><span>Staff</span>
        <select aria-label="Report staff" value={staff} onChange={(e) => onStaff(e.target.value)}>
          {(scopeOptions.staff.includes(staff)
            ? scopeOptions.staff : [...scopeOptions.staff, staff]).map((value) =>
            <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
    </div>
    <div className="reports-filter-secondary">
      <div className="reports-filter-range">
        <label><CalendarDays size={15} aria-hidden="true"/><span>From</span>
          <input type="date" aria-label="Report start date" value={from} onChange={(e) => onFrom(e.target.value)}/>
        </label>
        <label><span>To</span>
          <input type="date" aria-label="Report end date" value={to} onChange={(e) => onTo(e.target.value)}/>
        </label>
      </div>
      <div className="reports-filter-quick">
        <button type="button" onClick={onThisMonth}><CalendarDays size={15}/> This Month</button>
        <button type="button" className={isAllTime ? 'is-active' : ''} onClick={onAllTime}>
          <RotateCcw size={15}/> All Time
        </button>
      </div>
    </div>
    {dateError && <p className="reports-filter-error" role="alert">{dateError}</p>}
    <p className="reports-filter-caption">
      Financial charts reflect recorded transactions in the selected period. Stock value is a current snapshot.
      Staff filter does not apply to stock valuation.
    </p>
  </section>;
};
