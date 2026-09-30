import React from 'react';
export const Skeleton = ({ width = '100%', height = 14, className = '' }) => <span className={`ui-skeleton ${className}`.trim()} style={{ display: 'block', width, height }} aria-hidden="true" />;
