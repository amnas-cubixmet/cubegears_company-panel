import React from 'react';
import { CalendarDays, UserCheck, UserPlus, Users } from 'lucide-react';

export const StaffOverviewStats = ({ overview }) => {
  const cards = [
    { label: 'Total Staff', value: overview.total, meta: 'all employees', icon: Users },
    { label: 'Active', value: overview.active, meta: 'currently active', icon: UserCheck },
    { label: 'On Leave', value: overview.onLeave, meta: 'away today', icon: CalendarDays },
    { label: 'New Joiners', value: overview.newJoiners, meta: 'joined this year', icon: UserPlus },
  ];

  return (
    <section className="staff-dashboard-stats">
      {cards.map(({ label, value, meta, icon: Icon }) => (
        <article key={label} className="staff-dashboard-stat-card">
          <div className="staff-dashboard-stat-top">
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
            <i><Icon size={15} /></i>
          </div>
          <small>{meta}</small>
        </article>
      ))}
    </section>
  );
};
