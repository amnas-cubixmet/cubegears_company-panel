import React from 'react';
import { Plus, ReceiptText } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';

export const InvoiceListHeader = ({ activeTab, onCreate }) => {
  const { user } = useAuth();

  return (
    <header className="invoice-dashboard-header">
      <div>
        <h1>{activeTab === 'estimate' ? 'Estimates' : 'Invoices'}</h1>
        <p>{activeTab === 'estimate'
          ? 'Prepare quotations, track approvals, and convert accepted estimates to invoices.'
          : 'Manage customer invoices, payments, downloads and billing records.'}</p>
      </div>

      <div className="invoice-dashboard-header-actions">
        <div className="invoice-dashboard-header-badge">
          <ReceiptText size={13} />
          <span>Billing & Sales</span>
        </div>

        {hasPermission(user, 'invoices.create') && (
          <button type="button" className="bill-btn" onClick={onCreate}>
            <Plus size={14} />
            {activeTab === 'estimate' ? 'New Estimate' : 'New Invoice'}
          </button>
        )}
      </div>
    </header>
  );
};
