import React from 'react';

export const Switch = ({
  label,
  active = false,
  onChange,
  disabled = false,
  className = '',
  id
}) => {
  return (
    <label htmlFor={id} className={`custom-switch-wrapper ${className}`} style={{ opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}>
      <div className={`custom-switch ${active ? 'active' : ''}`}>
        <div className="custom-switch-thumb" />
      </div>
      <input
        id={id}
        type="checkbox"
        checked={active}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        style={{ display: 'none' }}
      />
      {label && <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{label}</span>}
    </label>
  );
};
