import React, { useId } from 'react';

export const Checkbox = ({ label, checked = false, onChange, disabled = false, className = '', id, ...props }) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  return <label className={`ui-check ${className}`.trim()} htmlFor={inputId}>
    <input id={inputId} type="checkbox" checked={checked} onChange={onChange} disabled={disabled} {...props} />
    {label && <span>{label}</span>}
  </label>;
};
