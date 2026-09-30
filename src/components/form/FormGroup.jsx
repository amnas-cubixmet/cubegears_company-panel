import React from 'react';
export const FormGroup = ({ children, columns = 2, className = '' }) => <div className={`form-group ${className}`.trim()} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{children}</div>;
