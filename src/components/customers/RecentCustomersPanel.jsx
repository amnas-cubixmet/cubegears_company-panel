import React from 'react';
import { Users } from 'lucide-react';

export const RecentCustomersPanel = ({ records, formatMoney, onNavigate }) => (
  <article className="customer-dashboard-panel">
    <header className="customer-dashboard-panel-title">
      <div>
        <h2>Recent Customers</h2>
        <p>Latest active workshop customers.</p>
      </div>
      <Users size={15} />
    </header>

    <div className="customer-dashboard-row-list">
      {records.slice(0, 5).map(({ customer, vehicles, jobs, outstanding }) => (
        <button
          key={customer.id}
          type="button"
          onClick={() => onNavigate(`/customers/${customer.id}`)}
        >
          <div>
            <strong>{customer.name}</strong>
            <span>{customer.phone} · {vehicles.length} vehicle(s) · {jobs.length} job(s)</span>
          </div>
          <b>{outstanding ? formatMoney(outstanding) : 'Clear'}</b>
        </button>
      ))}

      {!records.length && (
        <div className="customer-dashboard-empty">No customer records yet.</div>
      )}
    </div>
  </article>
);
