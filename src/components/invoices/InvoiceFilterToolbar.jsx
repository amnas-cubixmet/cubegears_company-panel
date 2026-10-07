import React from 'react';
import { Filter, Search } from 'lucide-react';

export const InvoiceFilterToolbar = ({
  query,
  onQueryChange,
  status,
  onStatusChange,
  statuses,
  resultCount,
}) => (
  <section className="invoice-dashboard-toolbar">
    <label className="invoice-dashboard-search">
      <Search size={14} />
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search invoice no, customer, phone, vehicle or Job Card"
      />
    </label>

    <label className="invoice-dashboard-status-filter">
      <Filter size={13} />
      <select value={status} onChange={(event) => onStatusChange(event.target.value)}>
        <option value="All">All Statuses</option>
        {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </label>

    <div className="invoice-dashboard-result-count">
      <span>Showing</span>
      <strong>{resultCount}</strong>
    </div>
  </section>
);
