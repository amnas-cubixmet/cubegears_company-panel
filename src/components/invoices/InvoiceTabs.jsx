import React from 'react';
import { FileText, ReceiptText, Truck } from 'lucide-react';

export const InvoiceTabs = ({ activeTab, onChange, onEWayBills }) => (
  <nav className="invoice-dashboard-tabs" aria-label="Billing navigation">
    <button
      type="button"
      className={activeTab === 'invoice' ? 'is-active' : ''}
      onClick={() => onChange('invoice')}
    >
      <ReceiptText size={13} />
      Invoices
    </button>

    <button
      type="button"
      className={activeTab === 'estimate' ? 'is-active' : ''}
      onClick={() => onChange('estimate')}
    >
      <FileText size={13} />
      Estimates
    </button>

    <button type="button" onClick={onEWayBills}>
      <Truck size={13} />
      E-Way Bills
    </button>
  </nav>
);
