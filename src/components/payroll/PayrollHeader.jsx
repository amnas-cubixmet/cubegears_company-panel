import React from 'react';
import { WalletCards } from 'lucide-react';

export const PayrollHeader = () => (
  <header className="payroll-dashboard-header">
    <div>
      <h1>Payroll & Salary</h1>
      <p>Salary structures, attendance-linked payroll, overtime, advances, payments and payslips.</p>
    </div>

    <div className="payroll-dashboard-header-badge">
      <WalletCards size={13} />
      <span>Payroll Control</span>
    </div>
  </header>
);
