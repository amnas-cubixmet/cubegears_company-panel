import React, { useMemo } from 'react';
import { WalletCards } from 'lucide-react';

const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const StaffPayrollHistory = ({
  payrolls,
  selectedMonth,
  onMonthChange,
  salaryStructure,
}) => {
  const months = useMemo(
    () => [...new Set(payrolls.map((row) => row.month).filter(Boolean))],
    [payrolls],
  );
  const visible = selectedMonth === 'All'
    ? payrolls
    : payrolls.filter((row) => row.month === selectedMonth);

  return (
    <div className="staff-profile-payroll">
      <header>
        <div>
          <WalletCards size={15} />
          <div><strong>Payroll History</strong><span>Month-wise salary, deductions and payment status.</span></div>
        </div>
        <select value={selectedMonth} onChange={(e) => onMonthChange(e.target.value)}>
          <option value="All">All Months</option>
          {months.map((month) => <option key={month}>{month}</option>)}
        </select>
      </header>

      {salaryStructure && (
        <div className="staff-profile-salary-summary">
          <div><span>Current Basic</span><strong>{money(salaryStructure.basicSalary || salaryStructure.basic)}</strong></div>
          <div><span>Allowances</span><strong>{money(salaryStructure.allowances)}</strong></div>
          <div><span>Overtime Rate</span><strong>{money(salaryStructure.overtimeRate)}</strong></div>
          <div><span>Effective From</span><strong>{salaryStructure.effectiveDate || '—'}</strong></div>
        </div>
      )}

      <div className="staff-profile-payroll-list">
        {visible.map((row) => (
          <article key={row.id}>
            <div><strong>{row.month}</strong><span>{row.paymentStatus || 'Unpaid'}</span></div>
            <div><span>Gross</span><strong>{money(row.grossSalary)}</strong></div>
            <div><span>Deductions</span><strong>{money(row.deductions)}</strong></div>
            <div><span>Net</span><strong>{money(row.netSalary)}</strong></div>
            <div><span>Paid</span><strong>{money(row.paidAmount)}</strong></div>
          </article>
        ))}
        {!visible.length && <div className="staff-workshop-empty">No payroll records for this period.</div>}
      </div>
    </div>
  );
};
