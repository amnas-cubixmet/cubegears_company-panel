import React from 'react';
import { Search, X } from 'lucide-react';
import { STATUS_OPTIONS } from './jobs.utils';

export const JobsToolbar = ({
  query,
  onQueryChange,
  status,
  onStatusChange,
}) => (
  <section className="jobs-toolbar" aria-label="Filter Job Cards">
    <label className="jobs-search">
      <Search size={18} aria-hidden="true" />
      <input
        type="search"
        aria-label="Search job cards"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search job number, customer, phone or vehicle"
      />
      {query && (
        <button
          type="button"
          className="jobs-search-clear"
          aria-label="Clear job search"
          onClick={() => onQueryChange('')}
        >
          <X size={16} />
        </button>
      )}
    </label>
    <label className="jobs-status-filter">
      <span className="jobs-filter-label">Status</span>
      <select
        aria-label="Filter job cards by status"
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
      >
        {STATUS_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </label>
  </section>
);
