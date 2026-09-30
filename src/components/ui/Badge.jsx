import React from 'react';

export const Badge = ({ children, variant = 'info', className = '', ...props }) => <span className={`ui-badge ui-badge--${variant} ${className}`.trim()} {...props}>{children}</span>;
