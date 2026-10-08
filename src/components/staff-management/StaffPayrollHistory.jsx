import React, { useMemo } from 'react';
import { WalletCards } from 'lucide-react';
import { payTypeLabel } from '../payroll/payTypes';

const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const primaryPay = (plan = {}) => {
  const type = plan.paymentType;

  if (['daily', 'daily_commission'].includes(type)) {
    return money(plan.dailyWageRate || plan.dailyRate) + ' / day';
  }
  if (['hourly', 'hourly_commission'].includes(type)) {
    return money(plan.hourlyWageRate || plan.hourlyRate) + ' / hour';
  }
  if (type === 'commission') {
    if (plan.commissionType === 'fixed') {
      return money(plan.commissionFixedAmount) + ' / eligible job';
    }
    return Number(plan.commissionPercentage || 0) + '% commission';
  }
  if (type === 'hybrid') return 'Custom components';
  return money(plan.baseSalary || plan.fixedMonthlySalary || plan.basicSalary) + ' / month';
};

const commissionLabel = (plan = {}) => {
  if (!plan.commissionType || plan.commissionType === 'none') return 'None';
  if (plan.commissionType === 'fixed') return money(plan.commissionFixedAmount);
  return Number(plan.commissionPercentage || 0) + '%';
};

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

  const visible =
    selectedMonth === 'All'
      ? payrolls
      : payrolls.filter((row) => row.month === selectedMonth);

  return (
    <div className="staff-profile-payroll">
      <header>
        <div>
          <WalletCards size={15} />
          <div>
            <strong>Payroll History</strong>
            <span>Month-wise earnings, commission, deductions and payment status.</span>
          </div>
        </div>

        <select value={selectedMonth} onChange={(e) => onMonthChange(e.target.value)}>
          <option value="All">All Months</option>
          {months.map((month) => <option key={month}>{month}</option>)}
        </select>
      </header>

      {salaryStructure && (
        <div className="staff-profile-salary-summary">
          <div>
            <span>Payment Type</span>
            <strong>
              {salaryStructure.selectedPayStructure ||
                payTypeLabel(salaryStructure.paymentType)}
            </strong>
          </div>
          <div>
            <span>Primary Pay</span>
            <strong>{primaryPay(salaryStructure)}</strong>
          </div>
          <div>
            <span>Commission</span>
            <strong>{commissionLabel(salaryStructure)}</strong>
          </div>
          <div>
            <span>Effective From</span>
            <strong>{salaryStructure.effectiveDate || '—'}</strong>
          </div>
        </div>
      )}

      {!salaryStructure && (
        <div className="staff-workshop-empty">
          Salary & payment settings are not configured for this employee.
        </div>
      )}

      <div className="staff-profile-payroll-list">
        {visible.map((row) => (
          <article key={row.id}>
            <div>
              <strong>{row.month}</strong>
              <span>{row.paymentStatus || 'Unpaid'}</span>
            </div>
            <div><span>Base / Earned</span><strong>{money(row.baseSalary)}</strong></div>
            <div><span>Commission</span><strong>{money(row.approvedCommission)}</strong></div>
            <div><span>Deductions</span><strong>{money(row.deductions)}</strong></div>
            <div><span>Net</span><strong>{money(row.netSalary)}</strong></div>
            <div><span>Paid</span><strong>{money(row.paidAmount)}</strong></div>
          </article>
        ))}

        {!visible.length && (
          <div className="staff-workshop-empty">
            No payroll records for this period.
          </div>
        )}
      </div>
    </div>
  );
};
