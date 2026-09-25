import React from 'react';

export const PageHeader = ({ title, description, actions, children, className = '' }) => (
  <header className={['ui-page-header flex w-full min-w-0 flex-wrap items-start justify-between gap-3', className].join(' ').trim()}>
    <div className="min-w-0 flex-1">
      <h1 className="m-0 text-xl font-extrabold tracking-tight text-content md:text-2xl">{title}</h1>
      {description ? <p className="mt-1 max-w-3xl text-[13px] leading-5 text-muted">{description}</p> : null}
      {children}
    </div>

    {actions ? (
      <div className="component-demo-row flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
        {actions}
      </div>
    ) : null}
  </header>
);
