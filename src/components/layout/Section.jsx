import React from 'react';

export const Section = ({ title, description, children, className = '' }) => (
  <section className={['ui-section flex w-full min-w-0 flex-col gap-3', className].join(' ').trim()}>
    {(title || description) ? (
      <header className="ui-section__header">
        {title ? <h2 className="m-0 text-sm font-extrabold text-content">{title}</h2> : null}
        {description ? <p className="mt-1 text-xs leading-5 text-muted">{description}</p> : null}
      </header>
    ) : null}
    {children}
  </section>
);
