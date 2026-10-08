import React from 'react';
import { CalendarCheck2 } from 'lucide-react';

export const LeaveBalanceGrid = ({ balances }) => (
  <section className="leave-balance-section">
    <div className="leave-section-title">
      <div>
        <h3>Personal Leave Balances</h3>
        <p>Available company leave allocation for the current period.</p>
      </div>
    </div>

    <div className="leave-dashboard-stats">
      {balances.map((balance) => (
        <article key={balance.id || balance.type} className="leave-balance-card">
          <div className="leave-balance-top">
            <div>
              <span>{balance.type}</span>
              <strong>{balance.available}</strong>
            </div>
            <i><CalendarCheck2 size={15} /></i>
          </div>

          <small>
            days available · {balance.allocationPeriod === 'month' ? 'this month' : 'this year'}
          </small>

          <div className="leave-balance-meta">
            <span>Allocated <b>{balance.allocated}</b></span>
            <span>Used <b>{balance.used}</b></span>
            <span>Pending <b>{balance.pending}</b></span>
          </div>
        </article>
      ))}

      {!balances.length && (
        <div className="leave-empty-card">No leave balances configured yet.</div>
      )}
    </div>
  </section>
);
