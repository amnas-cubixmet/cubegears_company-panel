import React, { useEffect, useState } from 'react';
import { Save, WalletCards } from 'lucide-react';
import { ResponsiveModalSheet } from '../common/ResponsiveModalSheet';
import { dailyWageService } from '../../services/dailyWage.service';

const localDate = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

/**
 * Daily Wage ONLY. Kept as a small compatibility component for older callers;
 * no legacy salary, pay type, payment frequency or commission inputs.
 */
export const EmployeePayConfigurationSheet = ({ isOpen, onClose, structure, onSave }) => {
  const employeeId = structure?.employee?.id || structure?.staffId || structure?.employee;
  const [rate, setRate] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(localDate());
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRate(structure?.dailyRate ?? structure?.dailyWageRate ?? '');
      setEffectiveFrom(localDate());
      setReason('');
      setError('');
    }
  }, [isOpen, employeeId]);

  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    if (!employeeId) {
      setError('Select a staff member first.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const saved = await dailyWageService.addRate(employeeId, {
        rate,
        effectiveFrom,
        reason: reason.trim(),
      });
      // Optional callback signals success only; the component writes directly
      // to the Daily Wage Ledger to avoid creating an obsolete salary plan.
      if (typeof onSave === 'function') await onSave({ dailyWageSaved: true, employeeId, rate: saved.rate });
      onClose?.();
    } catch (err) {
      setError(err?.message || 'Could not save daily wage rate.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveModalSheet
      isOpen={isOpen}
      title={`Daily Wage Rate · ${structure?.staffName || structure?.employee?.name || 'Staff'}`}
      onClose={onClose}
      maxWidth="520px"
    >
      <form className="employee-pay-config-form" onSubmit={submit}>
        <div className="pay-config-revision-note">
          <WalletCards size={16} aria-hidden="true"/>
          Full Day 100%, Half Day 50%, Leave and Weekly Off ₹0.
          Approved OT/OD/Extra earnings are recorded in the employee Wage Account.
        </div>
        <label className="pay-config-field is-wide">
          <span>Daily Wage Rate (₹) *</span>
          <input name="dailyWageRate" type="number" min="0.01" step="0.01"
            required value={rate} onChange={(e) => setRate(e.target.value)}/>
        </label>
        <label className="pay-config-field is-wide">
          <span>Effective From *</span>
          <input type="date" required value={effectiveFrom}
            onChange={(e) => setEffectiveFrom(e.target.value)}/>
        </label>
        <label className="pay-config-field is-wide">
          <span>Reason for Rate Setup / Revision *</span>
          <textarea required rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for this daily wage rate"/>
        </label>
        {error && <div className="staff-directory-message is-error" role="alert">{error}</div>}
        <div className="pay-config-actions">
          <button type="button" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="is-primary" disabled={saving}>
            <Save size={15}/>{saving ? 'Saving…' : 'Save Daily Wage Rate'}
          </button>
        </div>
      </form>
    </ResponsiveModalSheet>
  );
};
