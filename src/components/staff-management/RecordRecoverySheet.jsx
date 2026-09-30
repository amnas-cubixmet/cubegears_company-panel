import React, { useState, useEffect } from 'react';
import { ResponsiveModalSheet } from '../common/ResponsiveModalSheet';

export const RecordRecoverySheet = ({ isOpen, onClose, advance, onSave }) => {
  const [formData, setFormData] = useState({
    staffName: '',
    advanceReference: '',
    currentOutstanding: 0,
    recoveryAmount: '',
    recoveryDate: new Date().toISOString().split('T')[0],
    payrollPeriod: 'September 2026',
    reference: '',
    remarks: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (advance) {
      setFormData({
        staffName: advance.staffName || '',
        advanceReference: advance.id || '',
        currentOutstanding: advance.outstandingBalance || 0,
        recoveryAmount: Math.min(advance.monthlyRecovery || 0, advance.outstandingBalance || 0).toString(),
        recoveryDate: new Date().toISOString().split('T')[0],
        payrollPeriod: 'September 2026',
        reference: `REC-${Date.now().toString().slice(-4)}`,
        remarks: 'Payroll deduction recovery'
      });
      setError('');
    }
  }, [advance]);

  if (!advance) return null;

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amt = Number(formData.recoveryAmount);
    if (!amt || amt <= 0) {
      setError('Please enter a valid recovery amount.');
      return;
    }

    if (amt > advance.outstandingBalance) {
      setError(`Recovery amount (${formatINR(amt)}) cannot exceed current outstanding balance (${formatINR(advance.outstandingBalance)}).`);
      return;
    }

    onSave(advance.id, {
      amount: amt,
      date: formData.recoveryDate,
      payrollPeriod: formData.payrollPeriod,
      reference: formData.reference,
      remarks: formData.remarks
    });
    onClose();
  };

  return (
    <ResponsiveModalSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Record Advance Recovery"
      maxWidth="520px"
    >
      <form className="payroll-sheet-form payroll-recovery-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {error && (
          <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--danger-soft)', color: 'var(--danger)', fontSize: '13px', fontWeight: '600' }}>
            {error}
          </div>
        )}

        <div style={{ backgroundColor: 'var(--surface-2)', padding: '12px 14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Staff Member</div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{formData.staffName}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Advance Ref: <strong>{formData.advanceReference}</strong></span>
            <span style={{ color: 'var(--text-muted)' }}>Current Outstanding: <strong style={{ color: 'var(--danger)' }}>{formatINR(formData.currentOutstanding)}</strong></span>
          </div>
        </div>

        <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Recovery Amount (₹) *</label>
            <input
              type="number"
              required
              placeholder="e.g. 2000"
              value={formData.recoveryAmount}
              onChange={(e) => setFormData({ ...formData, recoveryAmount: e.target.value })}
              style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Recovery Date *</label>
            <input
              type="date"
              required
              value={formData.recoveryDate}
              onChange={(e) => setFormData({ ...formData, recoveryDate: e.target.value })}
              style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
            />
          </div>
        </div>

        <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Payroll Period *</label>
            <select
              value={formData.payrollPeriod}
              onChange={(e) => setFormData({ ...formData, payrollPeriod: e.target.value })}
              style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
            >
              <option value="August 2026">August 2026</option>
              <option value="September 2026">September 2026</option>
              <option value="October 2026">October 2026</option>
              <option value="Manual Direct Cash">Manual Direct Cash</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Reference #</label>
            <input
              type="text"
              placeholder="e.g. REC-1002"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Remarks / Method</label>
          <input
            type="text"
            placeholder="e.g. Recovered through September payroll"
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ flex: 1, height: '46px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{ flex: 1, height: '46px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--primary)', color: '#ffffff', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
          >
            Record Recovery
          </button>
        </div>
      </form>
    </ResponsiveModalSheet>
  );
};
