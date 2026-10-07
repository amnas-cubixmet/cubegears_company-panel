import React from 'react';
import { Car, IndianRupee, Repeat2, Users } from 'lucide-react';

export const CustomerOverviewStats = ({ metrics, formatMoney }) => {
  const cards = [
    {
      label: 'Total Customers',
      value: metrics.total,
      meta: `${metrics.newCustomers} new this month`,
      icon: Users,
    },
    {
      label: 'Returning',
      value: metrics.returning,
      meta: 'repeat workshop visits',
      icon: Repeat2,
    },
    {
      label: 'Active Vehicles',
      value: metrics.activeVehicles,
      meta: 'linked customer vehicles',
      icon: Car,
    },
    {
      label: 'Outstanding',
      value: formatMoney(metrics.outstanding),
      meta: 'pending customer balance',
      icon: IndianRupee,
      tone: 'warning',
    },
  ];

  return (
    <section className="customer-dashboard-stats">
      {cards.map(({ label, value, meta, icon: Icon, tone = 'primary' }) => (
        <article key={label} className="customer-dashboard-stat-card">
          <div className="customer-dashboard-stat-top">
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
