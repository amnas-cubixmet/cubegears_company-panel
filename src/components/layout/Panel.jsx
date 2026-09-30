import React from 'react';

export const Panel = ({ children, className = '', ...props }) => (
  <section
    className={`min-w-0 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm ${className}`.trim()}
    {...props}
  >
    {children}
  </section>
);
