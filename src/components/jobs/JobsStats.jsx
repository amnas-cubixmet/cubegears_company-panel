import React from 'react';
import { CircleCheckBig, ClipboardList, Clock3, PackageSearch } from 'lucide-react';

export const JobsStats = ({ counts, onFilter }) => {
  const cards = [
    { label: 'Total Jobs', value: counts.total, icon: ClipboardList, filter: 'All', tone: 'default' },
    { label: 'Active Jobs', value: counts.active, icon: Clock3, filter: 'All', tone: 'primary' },
    { label: 'Waiting Parts', value: counts.waiting, icon: PackageSearch, filter: 'Waiting for Parts', tone: 'warning' },
    { label: 'Ready Delivery', value: counts.ready, icon: CircleCheckBig, filter: 'Ready for Delivery', tone: 'success' },
  ];

  return (
    <section className="jobs-kpi-grid">
      {cards.map(({ label, value, icon: Icon, filter, tone }) => (
        <button
          key={label}
          type="button"
          className={`jobs-kpi-card is-${tone}`}
          onClick={() => onFilter(filter)}
        >
          <div className="jobs-kpi-top">
            <span className="jobs-kpi-label">{label}</span>
            <span className="jobs-kpi-icon"><Icon size={15} /></span>
          </div>
          <strong>{value}</strong>
          <small>View records</small>
        </button>
      ))}
    </section>
  );
};
