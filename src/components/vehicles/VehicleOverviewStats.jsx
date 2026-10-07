import React from 'react';
import { AlertTriangle, CalendarClock, Car, ClipboardList } from 'lucide-react';

export const VehicleOverviewStats = ({ metrics }) => {
  const cards = [
    {
      label: 'Total Vehicles',
      value: metrics.total,
      meta: `${metrics.active} currently active`,
      icon: Car,
    },
    {
      label: 'Open Jobs',
      value: metrics.openJobs,
      meta: 'active workshop jobs',
      icon: ClipboardList,
    },
    {
      label: 'Service Due',
      value: metrics.serviceDue,
      meta: 'due within 30 days',
      icon: CalendarClock,
      tone: 'warning',
    },
    {
      label: 'Insurance Due',
      value: metrics.insuranceDue,
      meta: 'renewal attention',
      icon: AlertTriangle,
      tone: 'warning',
    },
  ];

  return (
    <section className="vehicle-dashboard-stats">
      {cards.map(({ label, value, meta, icon: Icon, tone = 'primary' }) => (
        <article key={label} className="vehicle-dashboard-stat-card">
          <div className="vehicle-dashboard-stat-top">
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
            <i className={`is-${tone}`}><Icon size={15} /></i>
          </div>
          <small>{meta}</small>
        </article>
      ))}
    </section>
  );
};
