import React from 'react';
export const Spinner = ({ size = 24, className = '', label = 'Loading' }) => <span className={`ui-spinner ${className}`.trim()} style={{ width: size, height: size }} role="status" aria-label={label} />;
