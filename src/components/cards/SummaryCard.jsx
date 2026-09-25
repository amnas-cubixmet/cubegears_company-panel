import React from 'react';

export const SummaryCard = ({ title, children, action, className = '' }) => {
  return (
    <div
      className={`summary-card-container ${className}`}
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '16px 14px',
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '14px',
        width: '100%',
        minWidth: 0
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: 'var(--text-primary)',
          margin: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flex: 1,
          minWidth: 0
        }}>
          {title}
        </h3>
        {action && (
          <div style={{ flexShrink: 0 }}>
            {action}
          </div>
        )}
      </div>
      <div style={{ width: '100%', minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
};
