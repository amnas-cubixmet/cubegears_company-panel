import React from 'react';
export const KeyValueList = ({ items = [], className = '' }) => <dl className={`ui-key-value ${className}`.trim()}>{items.map((item) => <div key={item.key || item.label}><dt>{item.label}</dt><dd>{item.value ?? '—'}</dd></div>)}</dl>;
