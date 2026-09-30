import React, { useState } from 'react';
import { ResponsiveModalSheet } from '../common/ResponsiveModalSheet';

export const CreateAdvanceSheet = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    staffName: 'Ajmal K',
    advanceDate: new Date().toISOString().split('T')[0],
    advanceAmount: '',
    reason: 'Personal Emergency',
    recoveryStartMonth: 'September 2026',
    recoveryMethod: 'Payroll Deduction',
    monthlyRecoveryAmount: '',
    notes: '',
    approvalStatus: 'Approved'
  });

  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.advanceAmount || Number(formData.advanceAmount) <= 0) {
      setError('Please enter a valid advance amount.');
      return;
    }
    if (!formData.monthlyRecoveryAmount || Number(formData.monthlyRecoveryAmount) <= 0) {
      setError('Please enter a valid monthly recovery amount.');
      return;
    }

    onSave({
      ...formData,
      advanceAmount: Number(formData.advanceAmount),
      monthlyRecovery: Number(formData.monthlyRecoveryAmount)
    });
    onClose();
  };

  return (
    <ResponsiveModalSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Create Salary Advance"
      maxWidth="540px"
    >
      <form className="payroll-sheet-form payroll-advance-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {error && (
          <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--danger-soft)', color: 'var(--danger)', fontSize: '13px', fontWeight: '600' }}>
            {error}
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Staff Member *</label>
          <select
            value={formData.staffName}
            onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
            style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
          >
            <option value="Ajmal K">Ajmal K (Mechanic)</option>
            <option value="Rajesh V">Rajesh V (Branch Manager)</option>
            <option value="Priya Nair">Priya Nair (Receptionist)</option>
            <option value="Suresh Kumar">Suresh Kumar (Technician)</option>
          </select>
        </div>

        <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Advance Date *</label>
            <input
              type="date"
              required
              value={formData.advanceDate}
              onChange={(e) => setFormData({ ...formData, advanceDate: e.target.value })}
              style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Advance Amount (₹) *</label>
            <input
              type="number"
              required
              placeholder="e.g. 10000"
              value={formData.advanceAmount}
              onChange={(e) => setFormData({ ...formData, advanceAmount: e.target.value })}
              style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Reason *</label>
          <input
            type="text"
            required
            placeholder="e.g. Medical emergency / Personal advance"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
          />
        </div>

        <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Recovery Start Month *</label>
            <select
              value={formData.recoveryStartMonth}
              onChange={(e) => setFormData({ ...formData, recoveryStartMonth: e.target.value })}
              style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
            >
              <option value="August 2026">August 2026</option>
              <option value="September 2026">September 2026</option>
              <option value="October 2026">October 2026</option>
              <option value="November 2026">November 2026</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Recovery Method *</label>
            <select
              value={formData.recoveryMethod}
              onChange={(e) => setFormData({ ...formData, recoveryMethod: e.target.value })}
              style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
            >
              <option value="Payroll Deduction">Payroll Deduction</option>
              <option value="Direct Cash Settlement">Direct Cash Settlement</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
        </div>

        <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Monthly Recovery Amount (₹) *</label>
            <input
              type="number"
              required
              placeholder="e.g. 2000"
              value={formData.monthlyRecoveryAmount}
              onChange={(e) => setFormData({ ...formData, monthlyRecoveryAmount: e.target.value })}
              style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Approval Status *</label>
            <select
              value={formData.approvalStatus}
              onChange={(e) => setFormData({ ...formData, approvalStatus: e.target.value })}
              style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
            >
              <option value="Approved">Approved</option>
              <option value="Pending Review">Pending Review</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Optional Notes</label>
          <textarea
            rows={2}
            placeholder="Add any internal approval remarks..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px', resize: 'vertical' }}
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
            Create Advance
          </button>
        </div>
      </form>
    </ResponsiveModalSheet>
  );
};
