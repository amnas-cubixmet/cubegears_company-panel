import React from 'react';
import { AlertCircle, BadgeCheck, CircleDollarSign, WalletCards } from 'lucide-react';

export const PayrollOverviewStats = ({
  totalNet,
  totalPaid,
  outstandingSalary,
  approvedCount,
  payrollCount,
  paidStaff,
  pendingStaff,
  pendingApprovalCount,
  formatINR,
}) => {
  const cards = [
    {
      label: 'Net Payroll',
      value: formatINR(totalNet),
      meta: `${payrollCount} employees`,
      icon: WalletCards,
    },
    {
      label: 'Paid Amount',
      value: formatINR(totalPaid),
      meta: `${paidStaff} fully paid`,
      icon: CircleDollarSign,
    },
    {
      label: 'Outstanding',
      value: formatINR(outstandingSalary),
      meta: `${pendingStaff} pending staff`,
      icon: AlertCircle,
    },
    {
      label: 'Approval Status',
      value: `${approvedCount}/${payrollCount}`,
      meta: `${pendingApprovalCount} awaiting approval`,
      icon: BadgeCheck,
    },
  ];

  return (
    <section className="payroll-dashboard-stats">
      {cards.map(({ label, value, meta, icon: Icon }) => (
        <article key={label} className="payroll-dashboard-stat-card">
          <div className="payroll-dashboard-stat-top">
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
            <i><Icon size={15} /></i>
          </div>
          <small>{meta}</small>
        </article>
      ))}
    </section>
  );
};
