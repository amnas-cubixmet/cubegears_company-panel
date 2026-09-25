import React from 'react';

export const PageHeader = ({ title, description, actions, children, className = '' }) => (
  <header className={`flex min-w-0 flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4 lg:pb-5 ${className}`.trim()}>
    <div className="min-w-0">
      <h1 className="m-0 break-words text-xl font-bold tracking-tight text-content sm:text-2xl lg:text-[28px]">{title}</h1>
      {description && <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{description}</p>}
      {children}
    </div>
    {actions && <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">{actions}</div>}
  </header>
);
