import React from 'react';

export const MobileCard = ({ title, subtitle, badge, fields = [], actions }) => (
  <article className="flex min-w-0 flex-col gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-sm">
    <div className="flex min-w-0 items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h4 className="m-0 truncate text-sm font-semibold text-content">{title}</h4>
        {subtitle && <span className="mt-0.5 block truncate text-xs text-secondary">{subtitle}</span>}
      </div>
      {badge && <div className="shrink-0">{badge}</div>}
    </div>
    {fields.length > 0 && (
      <div className="grid grid-cols-2 gap-2 border-y border-line py-2.5">
        {fields.map((field, index) => (
          <div key={index} className="min-w-0">
            <span className="block truncate text-[10px] font-semibold uppercase tracking-wide text-muted">{field.label}</span>
            <span className="mt-0.5 block truncate text-xs font-medium text-secondary">{field.value}</span>
          </div>
        ))}
      </div>
    )}
    {actions && <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">{actions}</div>}
  </article>
);
