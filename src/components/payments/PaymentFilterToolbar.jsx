import React from 'react';
import { Filter, RefreshCw, RotateCcw, Search } from 'lucide-react';

export const PaymentFilterToolbar = ({
  query, onQueryChange, status, onStatusChange, method, onMethodChange,
  statuses, methods, resultCount, onClear, onRefresh, loading
}) => {
  const hasFilters = Boolean(query.trim()) || status !== 'All' || method !== 'All';
  return (
    <section className="payments-dashboard-toolbar" aria-label="Payment filters">
      <label className="payments-dashboard-search">
        <Search size={17} aria-hidden="true" />
        <input
          type="search" aria-label="Search payment records"
          value={query} onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search receipt, customer, invoice or reference"
        />
      </label>
      <label className="payments-dashboard-filter">
        <Filter size={16} aria-hidden="true" />
        <select aria-label="Filter by payment status" value={status} onChange={(event) => onStatusChange(event.target.value)}>
          <option value="All">All Statuses</option>
          {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label className="payments-dashboard-filter">
        <select aria-label="Filter by payment method" value={method} onChange={(event) => onMethodChange(event.target.value)}>
          <option value="All">All Methods</option>
          {methods.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <button type="button" className="payments-toolbar-clear" onClick={onClear} disabled={!hasFilters}>
        <RotateCcw size={15} aria-hidden="true" /> Clear
      </button>
      <button type="button" className="payments-toolbar-refresh" onClick={onRefresh} disabled={loading}>
        <RefreshCw size={15} aria-hidden="true" /> Refresh
      </button>
      <div className="payments-dashboard-result-count" aria-live="polite">
        Showing <strong>{resultCount}</strong> records
      </div>
    </section>
  );
};
