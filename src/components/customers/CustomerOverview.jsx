import React from 'react';
import { CustomerOutstandingPanel } from './CustomerOutstandingPanel';
import { CustomerOverviewStats } from './CustomerOverviewStats';
import { CustomerQuickActions } from './CustomerQuickActions';
import { CustomerQuickLookup } from './CustomerQuickLookup';
import { RecentCustomersPanel } from './RecentCustomersPanel';

export const CustomerOverview = ({
  metrics,
  records,
  outstandingInvoices,
  lookup,
  setLookup,
  lookupResult,
  formatMoney,
  onNavigate,
}) => (
  <div className="customer-management-view customer-dashboard-overview">
    <CustomerOverviewStats metrics={metrics} formatMoney={formatMoney} />

    <CustomerQuickLookup
      query={lookup}
      onQueryChange={setLookup}
      result={lookupResult}
      formatMoney={formatMoney}
      onNavigate={onNavigate}
    />

    <section className="customer-dashboard-bottom-grid">
      <RecentCustomersPanel
        records={records}
        formatMoney={formatMoney}
        onNavigate={onNavigate}
      />

      <CustomerOutstandingPanel
        invoices={outstandingInvoices}
        formatMoney={formatMoney}
        onNavigate={onNavigate}
      />

      <CustomerQuickActions onNavigate={onNavigate} />
    </section>
  </div>
);
