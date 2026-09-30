import React from 'react';
import * as Icons from 'lucide-react';

export const StatCard = ({ title, value, change, context, icon = 'TrendingUp', trend = 'up', isFullWidth = false, className = '' }) => {
  const IconComponent = Icons[icon] || Icons.TrendingUp;
  return (
    <article className={`flex h-[92px] min-w-0 flex-col justify-between rounded-[12px] border border-line bg-surface p-3.5 shadow-sm transition hover:border-line-strong ${className}`.trim()}>
      <span className="block truncate text-xs font-medium text-secondary/80">{title}</span>
      <div className="flex min-w-0 items-end justify-between gap-2">
        <h3 className="m-0 min-w-0 flex-1 truncate text-[24px] font-semibold leading-none tracking-tight text-content">{value}</h3>
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-primary-soft text-primary border border-primary/10">
          <IconComponent size={17} aria-hidden="true" />
        </span>
      </div>
    </article>
  );
};


