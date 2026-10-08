import React from 'react';
import { BadgeCheck, ShieldCheck, UserCog, Users } from 'lucide-react';

export const RoleOverviewStats = ({ roles }) => {
  const protectedCount = roles.filter((role) => role.isProtected).length;
  const activeCount = roles.filter((role) => (role.status || 'Active') === 'Active').length;
  const assignedUsers = roles.reduce((sum, role) => sum + Number(role.usersCount || 0), 0);
  const customCount = Math.max(0, roles.length - protectedCount);

  const cards = [
    { label: 'Total Roles', value: roles.length, meta: 'configured access roles', icon: ShieldCheck },
    { label: 'Active Roles', value: activeCount, meta: 'currently enabled', icon: BadgeCheck, tone: 'success' },
    { label: 'Custom Roles', value: customCount, meta: 'editable roles', icon: UserCog },
    { label: 'Users Assigned', value: assignedUsers, meta: 'across all roles', icon: Users },
  ];

  return (
    <section className="roles-dashboard-stats">
      {cards.map(({ label, value, meta, icon: Icon, tone = 'primary' }) => (
        <article key={label} className="roles-dashboard-stat-card">
          <div className="roles-dashboard-stat-top">
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
            <i className={'is-' + tone}><Icon size={15} /></i>
          </div>
          <small>{meta}</small>
        </article>
      ))}
    </section>
  );
};
