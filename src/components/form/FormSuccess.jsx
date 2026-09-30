import React from 'react';
export const FormSuccess = ({ children, className = '' }) => <div className={`form-success-box ${className}`.trim()} role="status">{children}</div>;
