import React from 'react';
import { Plus, ReceiptText } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';

export const InvoiceListHeader = ({ activeTab, onCreate, onCreateCompany, onCreateIndividual, companyRegistered }) => {
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

        {hasPermission(user, 'invoices.create') && (activeTab === 'estimate' ? (
          <button type="button" className="bill-btn" onClick={onCreate}>
            <Plus size={14}/>New Estimate
          </button>
        ) : (
          <>
            <button type="button" className="bill-btn secondary" onClick={onCreateCompany || onCreate}>
              <Plus size={14}/>{companyRegistered ? 'Company Tax Invoice' : 'Company Invoice'}
            </button>
            <button type="button" className="bill-btn" onClick={onCreateIndividual || onCreate}>
              <Plus size={14}/>Simple Service Bill
            </button>
          </>
        ))}
      </div>
    </header>
  );
};
