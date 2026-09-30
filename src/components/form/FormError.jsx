import React from 'react';
export const FormError = ({ children, className = '' }) => <div className={`form-error-box ${className}`.trim()} role="alert">{children}</div>;
