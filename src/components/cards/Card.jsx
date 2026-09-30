import React from 'react';

export const Card = ({ title, description, action, children, className = '', ...props }) => (
  <article
    className={`min-w-0 overflow-hidden rounded-card border border-line bg-surface shadow-sm ${className}`.trim()}
    {...props}
  >
    {(title || description || action) && (
      <header className="flex min-w-0 flex-col gap-3 border-b border-line px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          {title && <h3 className="m-0 truncate text-sm font-bold leading-5 text-content">{title}</h3>}
          {description && <p className="mt-1 text-xs leading-5 text-muted">{description}</p>}
        </div>
        {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
      </header>
    )}
    {children}
  </article>
);
