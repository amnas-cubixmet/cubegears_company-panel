import React from 'react';

export const PageContainer = ({ children, className = '' }) => (
  <div className={['ui-page-container flex w-full min-w-0 flex-col gap-4', className].join(' ').trim()}>
    {children}
  </div>
);
