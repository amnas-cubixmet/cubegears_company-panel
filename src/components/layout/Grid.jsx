import React from 'react';

const gridColumns = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
};

export const Grid = ({ columns = 2, children, className = '' }) => (
  <div className={`grid min-w-0 gap-3 sm:gap-4 lg:gap-5 ${gridColumns[columns] || gridColumns[2]} ${className}`.trim()}>
    {children}
  </div>
);
