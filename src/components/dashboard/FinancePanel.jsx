import React from 'react';
import { CircleDollarSign } from 'lucide-react';

export const FinancePanel = ({ payments }) => (
  <article className="dashboard-panel">
    <div className="panel-title"><h2>Finance & Collections</h2><CircleDollarSign size={15} /></div>
    <div className="finance-list">
      {[
        ['Billed Revenue', payments?.billedAmount],
        ['Collected Cash', payments?.receivedPayments],
        ['Overdue Dues', payments?.overdueAmount],
      ].map(([label, value], index) => (
        <div key={label}>
          <span>{label}</span>
          <strong className={index === 2 ? 'danger-text' : ''}>{value}</strong>
        </div>
      ))}
    </div>
  </article>
);
