import React from 'react';

export const SegmentedControl = ({
  options = [],
  value,
  onChange,
  className = '',
  style = {}
}) => {
  return (
    <div className={`segmented-control ${className}`} style={style}>
      {options.map((opt) => {
        const val = typeof opt === 'object' ? opt.value : opt;
        const lbl = typeof opt === 'object' ? opt.label : opt;
        const isActive = value === val;

        return (
          <button
            key={val}
            type="button"
            className={`segmented-option ${isActive ? 'active' : ''}`}
            onClick={() => onChange?.(val)}
          >
            {lbl}
          </button>
        );
      })}
    </div>
  );
};
