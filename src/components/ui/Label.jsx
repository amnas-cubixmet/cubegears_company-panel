import React from 'react';

export const Label = ({ children, required = false, className = '', ...props }) => (
  <label className={`ui-label ${className}`.trim()} {...props}>
    {children}{required && <span className="ui-label__required">*</span>}
  </label>
);
