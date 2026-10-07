import React from 'react';
import { Search } from 'lucide-react';

export const VehicleSearchToolbar = ({ query, onQueryChange, resultCount }) => (
  <section className="vehicle-dashboard-toolbar">
    <label className="vehicle-dashboard-search">
      <Search size={14} />
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search registration, VIN, make/model, customer or phone"
      />
    </label>

    <div className="vehicle-dashboard-result-count">
      <span>Showing</span>
      <strong>{resultCount}</strong>
    </div>
  </section>
);
