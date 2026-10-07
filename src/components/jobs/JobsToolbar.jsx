import React from 'react';
import { Filter, Search } from 'lucide-react';
import { STATUS_OPTIONS } from './jobs.utils';

export const JobsToolbar = ({
  query,
  onQueryChange,
  status,
  onStatusChange,
}) => (
  <section className="jobs-toolbar">
    <label className="jobs-search">
      <Search size={14} />
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search job, customer, phone or vehicle registration"
      />
    </label>

    <label className="jobs-status-filter">
      <Filter size={13} />
      <select value={status} onChange={(event) => onStatusChange(event.target.value)}>
        {STATUS_OPTIONS.map((item) => <option key={item}>{item}</option>)}
      </select>
    </label>
  </section>
);
