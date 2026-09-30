import React from 'react';
import * as Icons from 'lucide-react';

export const StatCard = ({ title, value, change, context, icon = 'TrendingUp', trend = 'up', isFullWidth = false, className = '' }) => {
  const IconComponent = Icons[icon] || Icons.TrendingUp;
  return (
    <article className={`flex min-w-0 flex-col justify-between gap-3 rounded-card border border-line bg-surface p-4 shadow-sm transition-colors hover:border-line-strong ${className}`.trim()}>
      <span className="block truncate text-xs font-medium text-muted">{title}</span>
      <div className="flex min-w-0 items-center justify-between gap-3">
        <h3 className="m-0 min-w-0 flex-1 truncate text-xl font-bold leading-none tracking-tight text-content sm:text-2xl">{value}</h3>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          <IconComponent size={18} aria-hidden="true" />
        </span>
      </div>
      {(change || context) && <span className={`text-xs font-medium ${trend === 'down' ? 'text-danger' : 'text-muted'}`}>{change || context}</span>}
    </article>
  );
};
