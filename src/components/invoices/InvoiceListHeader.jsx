import React from 'react';
import { Plus, ReceiptText } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';

export const InvoiceListHeader = ({ activeTab, onCreate }) => {
  const { user } = useAuth();

  return (
    <header className="invoice-dashboard-header">
      <div>
        <h1>Invoices & Estimates</h1>
        <p>Create, manage, print and export workshop billing documents.</p>
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
