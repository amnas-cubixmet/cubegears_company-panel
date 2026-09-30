import React from 'react';

export const SummaryCard = ({ title, children, action, className = '' }) => (
  <section className={`w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-sm ${className}`.trim()}>
    <header className="flex min-w-0 items-center justify-between gap-3 border-b border-line px-4.5 py-3.5 sm:px-5">
      <h3 className="m-0 min-w-0 flex-1 truncate text-sm font-semibold leading-5 text-content">{title}</h3>
      {action && <div className="shrink-0">{action}</div>}
    </header>
    <div className="w-full min-w-0 p-4.5 sm:p-5">{children}</div>
  </section>
);

