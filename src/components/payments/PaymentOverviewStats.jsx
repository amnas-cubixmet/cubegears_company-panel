import React from 'react';
import { Banknote, CheckCircle2, Clock3, RotateCcw } from 'lucide-react';

export const PaymentOverviewStats = ({ payments, formatMoney }) => {
  const completed = payments.filter(
    (row) => String(row.status).toLowerCase() === 'completed',
  );
  const pending = payments.filter(
    (row) => String(row.status).toLowerCase() === 'pending',
  );
  const refunded = payments.filter(
    (row) => String(row.status).toLowerCase() === 'refunded',
  );
  const collected = completed.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  const cards = [
    { label: 'Total Payments', value: payments.length, meta: 'payment records', icon: Banknote },
    { label: 'Collected', value: formatMoney(collected), meta: completed.length + ' completed', icon: CheckCircle2, tone: 'success' },
    { label: 'Pending', value: pending.length, meta: 'awaiting completion', icon: Clock3, tone: 'warning' },
    { label: 'Refunded', value: refunded.length, meta: 'refunded payments', icon: RotateCcw, tone: 'danger' },
  ];

  return (
    <section className="payments-dashboard-stats">
      {cards.map(({ label, value, meta, icon: Icon, tone = 'primary' }) => (
        <article key={label} className="payments-dashboard-stat-card">
          <div className="payments-dashboard-stat-top">
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
            <i className={'is-' + tone}><Icon size={15} /></i>
          </div>
          <small>{meta}</small>
        </article>
      ))}
    </section>
  );
};
