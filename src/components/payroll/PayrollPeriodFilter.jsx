import React from 'react';
import { usePayrollPeriod } from '../../context/PayrollPeriodContext';
import { Filter } from 'lucide-react';

export const PayrollPeriodFilter = ({ showStaffFilter = true, showBranchFilter = true }) => {
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
    YEARS
  } = usePayrollPeriod();

  return (
    <div
      className="payroll-period-filter"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '10px 12px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <div className="payroll-period-filter__label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginRight: '4px' }}>
        <Filter size={15} style={{ color: 'var(--primary)' }} />
        <span>Payroll Period:</span>
      </div>

      {/* Month & Year Selects */}
      <div className="payroll-period-filter__period" style={{ display: 'flex', gap: '6px', flex: '1 1 auto', minWidth: '220px' }}>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{
            flex: 1,
            height: '38px',
            padding: '0 10px',
            borderRadius: '8px',
            backgroundColor: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          style={{
            width: '90px',
            height: '38px',
            padding: '0 10px',
            borderRadius: '8px',
            backgroundColor: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Optional Branch Filter */}
      {showBranchFilter && (
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          style={{
            height: '38px',
            padding: '0 10px',
            borderRadius: '8px',
            backgroundColor: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: '500',
            flex: '0 1 auto',
            minWidth: '150px'
          }}
        >
          <option value="All">All Branches</option>
          <option value="Main Garage Branch">Main Garage Branch</option>
          <option value="Kochi South Branch">Kochi South Branch</option>
        </select>
      )}

      {/* Optional Staff Filter */}
      {showStaffFilter && (
        <select
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
          style={{
            height: '38px',
            padding: '0 10px',
            borderRadius: '8px',
            backgroundColor: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: '500',
            flex: '0 1 auto',
            minWidth: '140px'
          }}
        >
          <option value="All">All Staff</option>
          <option value="EMP-0012">Ajmal K</option>
          <option value="EMP-0014">Rajesh V</option>
          <option value="EMP-0015">Priya Nair</option>
        </select>
      )}
    </div>
  );
};
