import React, { useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export const SearchableSelect = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select option...',
  error,
  required = false,
  disabled = false,
  containerStyle = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedOpt = options.find(o => (typeof o === 'object' ? o.value === value : o === value));
  const selectedLabel = selectedOpt ? (typeof selectedOpt === 'object' ? selectedOpt.label : selectedOpt) : '';

  const filteredOptions = options.filter(opt => {
    const lbl = typeof opt === 'object' ? opt.label : opt;
    return String(lbl).toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="form-field cubegears-field-group" style={{ display: 'flex', flexDirection: 'column', gap: '0', width: '100%', position: 'relative', ...containerStyle }}>
      {label && (
        <label className="form-label cubegears-label">
          <span>{label}</span>
          {required && <span className="required cubegears-required-asterisk">*</span>}
        </label>
      )}

      <div className="searchable-select-wrapper">
        <div
          className={`form-control ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          style={{ cursor: 'pointer', justifyContent: 'space-between' }}
        >
          <span style={{ color: selectedLabel ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '13px', fontWeight: '500' }}>
            {selectedLabel || placeholder}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {value && (
              <X
                size={14}
                style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange?.('');
                }}
              />
            )}
            <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>

        {isOpen && (
          <div className="searchable-select-menu">
            <div style={{ padding: '4px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
              <div className="form-control" style={{ height: '36px', padding: '0 8px' }}>
                <Search size={14} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type to search..."
                  autoFocus
                />
              </div>
            </div>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-muted)' }}>No matching options</div>
            ) : (
              filteredOptions.map((opt) => {
                const val = typeof opt === 'object' ? opt.value : opt;
                const lbl = typeof opt === 'object' ? opt.label : opt;
                return (
                  <div
                    key={val}
                    className={`searchable-select-item ${val === value ? 'selected' : ''}`}
                    onClick={() => {
                      onChange?.(val);
                      setIsOpen(false);
                    }}
                  >
                    {lbl}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      {error && <span className="form-error cubegears-error-text">{error}</span>}
    </div>
  );
};
