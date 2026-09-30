import React from 'react';

export const IconButton = ({ label, children, className = '', type = 'button', ...props }) => (
  <button type={type} className={`ui-icon-button ${className}`.trim()} aria-label={label} title={label} {...props}>{children}</button>
);
