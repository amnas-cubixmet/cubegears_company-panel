import React from 'react';
import { PieChart } from 'lucide-react';

export const PayrollBreakdownPanel = ({
  totalGross,
  totalIncentives,
  totalApprovedOtPay,
  totalDeductions,
  totalNet,
  totalPaid,
  formatINR,
}) => {
  const progress = totalNet > 0
    ? Math.min(100, Math.round((totalPaid / totalNet) * 100))
    : 0;

  return (
    <article className="payroll-dashboard-panel">
      <header className="payroll-dashboard-panel-title">
        <div>
          <h2>Payroll Breakdown</h2>
          <p>Monthly salary composition and settlement progress.</p>
        </div>
        <PieChart size={15} />
      </header>

      <div className="payroll-dashboard-breakdown-list">
        <div><span>Gross Payroll</span><strong>{formatINR(totalGross)}</strong></div>
        <div><span>Incentives</span><strong>{formatINR(totalIncentives)}</strong></div>
        <div><span>Overtime Pay</span><strong>{formatINR(totalApprovedOtPay)}</strong></div>
        <div><span>Deductions</span><strong>- {formatINR(totalDeductions)}</strong></div>
      </div>

      <div className="payroll-dashboard-progress">
        <div>
          <span>Settlement progress</span>
          <strong>{progress}%</strong>
        </div>
        <div className="payroll-dashboard-progress-track">
          <i style={{ width: `${progress}%` }} />
        </div>
      </div>
    </article>
  );
};
