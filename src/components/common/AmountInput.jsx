import React from 'react';
import { IndianRupee } from 'lucide-react';

export const AmountInput = ({
  label,
  error,
  helper,
  required = false,
  disabled = false,
  containerStyle = {},
  style = {},
  className = '',
  id,
  ...props
}) => {
  return (
    <div className={`form-field cubegears-field-group ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '0', width: '100%', boxSizing: 'border-box', ...containerStyle }}>
      {label && (
        <label htmlFor={id} className="form-label cubegears-label">
          <span>{label}</span>
          {required && <span className="required cubegears-required-asterisk">*</span>}
        </label>
      )}
      <div className={`form-control ${error ? 'has-error cubegears-field-error' : ''} ${disabled ? 'is-disabled' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', paddingRight: '6px', borderRight: '1px solid var(--border)', flexShrink: 0 }}>
          <IndianRupee size={15} />
        </div>
        <input
          id={id}
          type="number"
          disabled={disabled}
          style={style}
          {...props}
        />
      </div>
      {helper && !error && <span className="form-helper">{helper}</span>}
      {error && <span className="form-error cubegears-error-text">{error}</span>}
    </div>
  );
};
