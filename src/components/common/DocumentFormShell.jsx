import React from 'react';

export function DocumentFormHeader({
  eyebrow,
  title,
  description,
  actions
}) {
  return (
    <header className="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-primary">
            {eyebrow}
          </div>
        ) : null}

        <h1 className="m-0 text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-content md:text-2xl">
          {title}
        </h1>

        {description ? (
          <p className="mt-1.5 max-w-2xl text-xs leading-5 text-muted">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}

export function DocumentFormSheet({
  children,
  className = '',
  minWidth = '860px',
  maxWidth = '1100px'
}) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <section
        className={[
          'mx-auto w-full overflow-hidden border border-slate-300 bg-white text-slate-950 shadow-[0_10px_30px_rgba(15,23,42,.08)]',
          className
        ].join(' ')}
        style={{ minWidth, maxWidth }}
      >
        {children}
      </section>
    </div>
  );
}

export default DocumentFormSheet;
