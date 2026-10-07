import React from 'react';
import { BadgeCheck } from 'lucide-react';

export const PayrollSettlementPanel = ({
  paidStaff,
  partialStaff,
  unpaidStaff,
  pendingApprovalCount,
}) => (
  <article className="payroll-dashboard-panel">
    <header className="payroll-dashboard-panel-title">
      <div>
        <h2>Settlement Status</h2>
        <p>Employee salary payment progress.</p>
      </div>
      <BadgeCheck size={15} />
    </header>

    <div className="payroll-dashboard-settlement-list">
      <div className="is-paid"><span>Paid</span><strong>{paidStaff}</strong></div>
      <div className="is-partial"><span>Partially Paid</span><strong>{partialStaff}</strong></div>
      <div className="is-unpaid"><span>Unpaid</span><strong>{unpaidStaff}</strong></div>
      <div className="is-pending"><span>Pending Approval</span><strong>{pendingApprovalCount}</strong></div>
    </div>
  </article>
);
