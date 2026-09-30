import React, { useId } from 'react';

export const Radio = ({ label, className = '', id, ...props }) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  return <label className={`ui-radio ${className}`.trim()} htmlFor={inputId}>
    <input id={inputId} type="radio" {...props} />
    {label && <span>{label}</span>}
  </label>;
};
