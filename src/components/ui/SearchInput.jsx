import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchInput = ({ value = '', onChange, onClear, className = '', placeholder = 'Search...', ...props }) => (
  <div className={`ui-search-input ${className}`.trim()}>
    <div className="ui-input-shell">
      <Search size={17} aria-hidden="true" />
      <input className="ui-input" type="search" value={value} onChange={onChange} placeholder={placeholder} {...props} />
      {value && <button className="ui-search-input__clear" type="button" onClick={() => onClear ? onClear() : onChange?.({ target: { value: '' } })} aria-label="Clear search"><X size={15} /></button>}
    </div>
  </div>
);
