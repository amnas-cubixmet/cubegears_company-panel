import React from 'react';
import { ResponsiveModalSheet } from '../common/ResponsiveModalSheet';

export const RecoveryHistoryModal = ({ isOpen, onClose, advance }) => {
  if (!advance) return null;

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const historyList = advance.recoveryHistory || [];

  return (
    <ResponsiveModalSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Recovery History: ${advance.staffName}`}
      maxWidth="540px"
    >
      <div className="payroll-recovery-history" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Advance Header Summary */}
        <div style={{ backgroundColor: 'var(--surface-2)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Advance Amount</div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>{formatINR(advance.advanceAmount)}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Recovered</div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--success)' }}>{formatINR(advance.recoveredAmount)}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Outstanding Balance</div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--danger)' }}>{formatINR(advance.outstandingBalance)}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Status</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: advance.status === 'Fully Recovered' ? 'var(--success)' : 'var(--primary)' }}>
              {advance.status}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
          Recovery Transactions ({historyList.length})
        </div>

        {historyList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', backgroundColor: 'var(--surface-2)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>
            No recovery transactions recorded for this advance yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto', paddingRight: '4px' }}>
            {historyList.map((rec) => (
              <div
                key={rec.id}
                style={{
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--success)' }}>
                    {formatINR(rec.amount)}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', backgroundColor: 'var(--surface)', padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    {rec.month}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <div>Date: <strong style={{ color: 'var(--text-primary)' }}>{rec.date}</strong></div>
                  <div>Ref: <strong style={{ color: 'var(--text-primary)' }}>{rec.reference || 'N/A'}</strong></div>
                  <div>Recorded By: <strong style={{ color: 'var(--text-primary)' }}>{rec.recordedBy || 'System'}</strong></div>
                </div>

                {rec.remarks && (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: '4px', marginTop: '2px' }}>
                    {rec.remarks}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ResponsiveModalSheet>
  );
};
