import React from 'react';
import { FileText } from 'lucide-react';
import { PayrollCard } from '../staff-management/PayrollCard';

export const PayrollRecordsPanel = ({
  payrolls,
  loading,
  periodString,
  onRecordPayment,
  onViewDetails,
  onViewPayslip,
  onViewHistory,
}) => (
  <section className="payroll-dashboard-records">
    <header className="payroll-dashboard-section-title">
      <div>
        <h2>Employee Payroll</h2>
        <p>Current payroll records for {periodString}.</p>
      </div>
      <FileText size={15} />
    </header>

    {loading ? (
      <div className="payroll-dashboard-empty">Loading payroll records…</div>
    ) : payrolls.length === 0 ? (
      <div className="payroll-dashboard-empty">No payroll records found for {periodString}.</div>
    ) : (
      <div className="payroll-card-grid payroll-dashboard-record-grid">
        {payrolls.map((payroll) => (
          <PayrollCard
            key={payroll.id}
            payroll={payroll}
            onRecordPayment={onRecordPayment}
            onViewDetails={onViewDetails}
            onViewPayslip={onViewPayslip}
            onViewHistory={onViewHistory}
          />
        ))}
      </div>
    )}
  </section>
);
