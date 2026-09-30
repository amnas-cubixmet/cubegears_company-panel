import React from 'react';

export const PageContainer = ({ children, className = '' }) => (
  <div className={`mx-auto flex w-full min-w-0 max-w-[1440px] flex-col gap-4 sm:gap-5 lg:gap-6 ${className}`.trim()}>
    {children}
  </div>
);
