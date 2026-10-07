import React from 'react';
import { Clock3, UserCheck, Users, UserX } from 'lucide-react';

export const AttendanceStats = ({ stats }) => {
  const cards = [
    { label: 'Total Staff', value: stats.total, meta: 'active employees', icon: Users },
    { label: 'Present', value: stats.present, meta: 'checked in / present', icon: UserCheck },
    { label: 'Absent', value: stats.absent, meta: 'not present today', icon: UserX },
    { label: 'Late', value: stats.late, meta: 'late arrivals', icon: Clock3 },
  ];

  return (
    <section className="am-dashboard-stats">
      {cards.map(({ label, value, meta, icon: Icon }) => (
        <article key={label} className="am-dashboard-stat-card">
          <div className="am-dashboard-stat-top">
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
