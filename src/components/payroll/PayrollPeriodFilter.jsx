import React from 'react';
import { Filter } from 'lucide-react';
import { usePayrollPeriod } from '../../context/PayrollPeriodContext';

export const PayrollPeriodFilter = ({
  showStaffFilter = true,
  showBranchFilter = true,
}) => {
  const {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    selectedBranch,
    setSelectedBranch,
    selectedStaff,
    setSelectedStaff,
    MONTHS,
    YEARS,
  } = usePayrollPeriod();

  return (
    <section className="payroll-period-filter">
      <div className="payroll-period-filter__label">
        <Filter size={14} />
        <span>Payroll Period</span>
      </div>

      <div className="payroll-period-filter__period">
        <select
          value={selectedMonth}
          onChange={(event) => setSelectedMonth(event.target.value)}
          aria-label="Payroll month"
        >
          {MONTHS.map((month) => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(event) => setSelectedYear(Number(event.target.value))}
          aria-label="Payroll year"
        >
          {YEARS.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {showBranchFilter && (
        <select
          value={selectedBranch}
          onChange={(event) => setSelectedBranch(event.target.value)}
          aria-label="Payroll branch"
        >
          <option value="All">All Branches</option>
          <option value="Main Garage Branch">Main Garage Branch</option>
          <option value="Kochi South Branch">Kochi South Branch</option>
        </select>
      )}

      {showStaffFilter && (
        <select
          value={selectedStaff}
          onChange={(event) => setSelectedStaff(event.target.value)}
          aria-label="Payroll staff"
        >
          <option value="All">All Staff</option>
          <option value="EMP-0012">Ajmal K</option>
          <option value="EMP-0014">Rajesh V</option>
          <option value="EMP-0015">Priya Nair</option>
        </select>
      )}
    </section>
  );
};
