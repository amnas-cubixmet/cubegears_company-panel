import React from 'react';
import { CalendarCheck2, CircleDollarSign } from 'lucide-react';

export const LeaveBalanceGrid = ({ balances }) => (
  <section className="leave-balance-section">
    <div className="leave-section-title">
      <div>
        <h3>Personal Leave Balances</h3>
        <p>Configured leave types are paid leave. Unpaid Leave is always available separately.</p>
      </div>
    </div>

    <div className="leave-dashboard-stats">
      {balances.map((balance) => (
        <article
          key={balance.id || balance.type}
          className={`leave-balance-card ${balance.isUnpaid ? 'is-unpaid' : ''}`}
        >
          <div className="leave-balance-top">
            <div>
              <span>{balance.type}</span>
              <strong>{balance.isUnpaid ? 'Always' : balance.available}</strong>
            </div>
            <i>
              {balance.isUnpaid
                ? <CircleDollarSign size={15} />
                : <CalendarCheck2 size={15} />}
            </i>
          </div>

          <small>
            {balance.isUnpaid
              ? 'No paid leave balance required'
              : `days available · ${balance.allocationPeriod === 'month' ? 'this month' : 'this year'}`}
          </small>

          <div className="leave-balance-meta">
            {balance.isUnpaid ? (
              <>
                <span>Type <b>Unpaid</b></span>
                <span>Used <b>{balance.used}</b></span>
                <span>Pending <b>{balance.pending}</b></span>
              </>
            ) : (
              <>
                <span>Allocated <b>{balance.allocated}</b></span>
                <span>Used <b>{balance.used}</b></span>
                <span>Pending <b>{balance.pending}</b></span>
              </>
            )}
          </div>
        </article>
      ))}

      {!balances.length && (
        <div className="leave-empty-card">Unpaid Leave is available even without paid leave allocation.</div>
      )}
    </div>
  </section>
);
