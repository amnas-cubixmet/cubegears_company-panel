import React from 'react';
import { PayrollBreakdownPanel } from './PayrollBreakdownPanel';
import { PayrollOverviewStats } from './PayrollOverviewStats';
import { PayrollQuickActions } from './PayrollQuickActions';
import { PayrollRecordsPanel } from './PayrollRecordsPanel';
import { PayrollSettlementPanel } from './PayrollSettlementPanel';

export const PayrollOverview = ({
  payrolls,
  loading,
  periodString,
  totals,
  formatINR,
  onRecordPayment,
  onViewDetails,
  onViewPayslip,
  onViewHistory,
}) => (
  <div className="payroll-dashboard-overview">
    <PayrollOverviewStats
      totalNet={totals.totalNet}
      totalPaid={totals.totalPaid}
      outstandingSalary={totals.outstandingSalary}
      approvedCount={totals.approvedCount}
      payrollCount={payrolls.length}
      paidStaff={totals.paidStaff}
      pendingStaff={totals.unpaidStaff + totals.partialStaff}
      pendingApprovalCount={totals.pendingApprovalCount}
      formatINR={formatINR}
    />

    <section className="payroll-dashboard-bottom-grid">
      <PayrollBreakdownPanel
        totalGross={totals.totalGross}
        totalIncentives={totals.totalIncentives}
        totalApprovedOtPay={totals.totalApprovedOtPay}
        totalDeductions={totals.totalDeductions}
        totalNet={totals.totalNet}
        totalPaid={totals.totalPaid}
        formatINR={formatINR}
      />

      <PayrollSettlementPanel
        paidStaff={totals.paidStaff}
        partialStaff={totals.partialStaff}
        unpaidStaff={totals.unpaidStaff}
        pendingApprovalCount={totals.pendingApprovalCount}
      />

      <PayrollQuickActions />
    </section>

    <PayrollRecordsPanel
      payrolls={payrolls}
      loading={loading}
      periodString={periodString}
      onRecordPayment={onRecordPayment}
      onViewDetails={onViewDetails}
      onViewPayslip={onViewPayslip}
      onViewHistory={onViewHistory}
    />
  </div>
);
