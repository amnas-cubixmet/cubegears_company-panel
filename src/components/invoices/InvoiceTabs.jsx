import React from 'react';
import { FileText, ReceiptText, Truck } from 'lucide-react';

export const InvoiceTabs = ({ activeTab, onChange, onEWayBills }) => (
  <nav className="invoice-dashboard-tabs" aria-label="Billing navigation">
    <button
      type="button"
      className={activeTab === 'invoice' ? 'is-active' : ''}
      aria-current={activeTab === 'invoice' ? 'page' : undefined}
      onClick={() => onChange('invoice')}
    >
      <ReceiptText size={13} />
      Invoices
    </button>

    <button
      type="button"
      className={activeTab === 'estimate' ? 'is-active' : ''}
      aria-current={activeTab === 'estimate' ? 'page' : undefined}
      onClick={() => onChange('estimate')}
    >
      <FileText size={13} />
      Estimates
    </button>

    <button type="button" className={activeTab === 'eway' ? 'is-active' : ''} aria-current={activeTab === 'eway' ? 'page' : undefined} onClick={onEWayBills}>
      <Truck size={13} />
      E-Way Bills
    </button>
  </nav>
);
