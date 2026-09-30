import React, { useId } from 'react';

export const Switch = ({ label, active, checked, onChange, disabled = false, className = '', id }) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const isChecked = checked ?? active ?? false;
  return <label className={`ui-switch ${className}`.trim()} htmlFor={inputId}>
    <input id={inputId} type="checkbox" checked={isChecked} disabled={disabled} onChange={(event) => onChange?.(event.target.checked, event)} />
    <span className="ui-switch__track"><span className="ui-switch__thumb" /></span>
    {label && <span>{label}</span>}
  </label>;
};
