import React from 'react';
import { Plus } from 'lucide-react';

export const AdvanceCard = ({ advance, onRecordRecovery, onViewDetails }) => {
  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Active':
        return { backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', border: '1px solid var(--primary-soft)' };
      case 'Fully Recovered':
        return { backgroundColor: 'var(--success-soft)', color: 'var(--success)', border: '1px solid var(--success-soft)' };
      case 'Paused':
        return { backgroundColor: 'var(--warning-soft)', color: 'var(--warning)', border: '1px solid var(--warning-soft)' };
      case 'Cancelled':
        return { backgroundColor: 'var(--danger-soft)', color: 'var(--danger)', border: '1px solid var(--danger-soft)' };
      default:
        return { backgroundColor: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' };
    }
  };

  return (
    <div
      className="payroll-advance-card"
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Staff Name & Status Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>{advance.staffName}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Advance Date: <strong style={{ color: 'var(--text-secondary)' }}>{advance.advanceDate}</strong>
          </div>
        </div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: '700',
            padding: '3px 10px',
            borderRadius: '8px',
            whiteSpace: 'nowrap',
            ...getStatusBadgeStyle(advance.status)
          }}
        >
          {advance.status}
        </span>
      </div>

      {/* 2x2 Summary Grid */}
      <div className="advance-summary-grid">
        <div style={{ backgroundColor: 'var(--surface-2)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Advance Amount</div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
            {formatINR(advance.advanceAmount)}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface-2)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Recovered</div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--success)', marginTop: '2px' }}>
            {formatINR(advance.recoveredAmount)}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface-2)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Outstanding</div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--danger)', marginTop: '2px' }}>
            {formatINR(advance.outstandingBalance)}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface-2)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Monthly Recovery</div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--primary)', marginTop: '2px' }}>
            {formatINR(advance.monthlyRecovery)}
          </div>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
        <button
          type="button"
          disabled={advance.outstandingBalance <= 0 || advance.status !== 'Active'}
          onClick={() => onRecordRecovery(advance)}
          style={{
            height: '40px',
            borderRadius: '10px',
            backgroundColor: advance.outstandingBalance <= 0 || advance.status !== 'Active' ? 'var(--surface-2)' : 'var(--primary)',
            color: advance.outstandingBalance <= 0 || advance.status !== 'Active' ? 'var(--text-muted)' : '#ffffff',
            border: 'none',
            fontSize: '13px',
            fontWeight: '700',
            cursor: advance.outstandingBalance <= 0 || advance.status !== 'Active' ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          Record Recovery
        </button>

        <button
          type="button"
          onClick={() => onViewDetails(advance)}
          style={{
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'var(--surface-2)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};
