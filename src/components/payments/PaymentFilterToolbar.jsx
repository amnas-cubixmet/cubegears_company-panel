import React from 'react';
import { Filter, Search } from 'lucide-react';

export const PaymentFilterToolbar = ({
  query,
  onQueryChange,
  status,
  onStatusChange,
  method,
  onMethodChange,
  statuses,
  methods,
  resultCount,
}) => (
  <section className="payments-dashboard-toolbar">
    <label className="payments-dashboard-search">
      <Search size={14} />
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search receipt, customer, invoice or reference"
      />
    </label>

    <label className="payments-dashboard-filter">
      <Filter size={13} />
      <select value={status} onChange={(event) => onStatusChange(event.target.value)}>
        <option value="All">All Statuses</option>
        {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </label>

    <label className="payments-dashboard-filter">
      <select value={method} onChange={(event) => onMethodChange(event.target.value)}>
        <option value="All">All Methods</option>
        {methods.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </label>

    <div className="payments-dashboard-result-count">
      <span>Showing</span>
      <strong>{resultCount}</strong>
    </div>
  </section>
);
