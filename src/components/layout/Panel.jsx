import React from 'react';

export const Panel = ({ children, className = '', ...props }) => (
  <div
    className={['ui-panel min-w-0 rounded-2xl border border-line bg-surface shadow-sm', className].join(' ').trim()}
    {...props}
  >
    {children}
  </div>
);
