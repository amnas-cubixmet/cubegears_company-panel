import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const CustomerOutstandingPanel = ({ invoices, formatMoney, onNavigate }) => (
  <article className="customer-dashboard-panel">
    <header className="customer-dashboard-panel-title">
      <div>
        <h2>Outstanding Attention</h2>
        <p>Customers with pending or partial invoices.</p>
      </div>
      <button type="button" onClick={() => onNavigate('/customers/outstanding')}>View All</button>
    </header>

    <div className="customer-dashboard-row-list">
      {invoices.slice(0, 5).map((invoice) => (
        <button
          key={`${invoice.customer.id}-${invoice.invoiceNo}`}
          type="button"
          onClick={() => onNavigate(`/customers/${invoice.customer.id}`)}
        >
          <div>
            <strong>{invoice.customer.name}</strong>
            <span>{invoice.invoiceNo} · {invoice.vehicle || 'Vehicle'}</span>
          </div>
          <b className="is-warning">{formatMoney(invoice.balanceDue)}</b>
        </button>
      ))}

      {!invoices.length && (
        <div className="customer-dashboard-empty">
          <AlertTriangle size={13} />
          No outstanding customer invoices.
        </div>
      )}
    </div>
  </article>
);
