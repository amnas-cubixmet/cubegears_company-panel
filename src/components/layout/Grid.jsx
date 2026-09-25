import React from 'react';

const columnClass = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
};

export const Grid = ({ columns = 2, children, className = '' }) => (
  <div className={['ui-grid grid w-full min-w-0 gap-3', columnClass[columns] || columnClass[2], className].join(' ').trim()}>
    {children}
  </div>
);
