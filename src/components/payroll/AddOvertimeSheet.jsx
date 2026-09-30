import React, { useState, useEffect } from 'react';
import { ResponsiveModalSheet } from '../common/ResponsiveModalSheet';

export const AddOvertimeSheet = ({ isOpen, onClose, onSave, prefillStaff }) => {
  const [formData, setFormData] = useState({
    staffId: 'EMP-0012',
    staffName: 'Ajmal K',
    date: new Date().toISOString().split('T')[0],
    payrollMonth: 'September 2026',
    branch: 'Main Garage Branch',
    shift: 'General Shift (09:00 AM - 06:00 PM)',
    clockIn: '09:00 AM',
    clockOut: '08:30 PM',
    overtimeHours: '2.5',
    calculationMethod: 'Hourly Rate', // Hourly Rate | Fixed Amount | Manual Authorized Amount
    rate: '150',
    amount: '375',
    reason: 'Emergency customer vehicle repair',
    notes: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (prefillStaff) {
      setFormData((prev) => ({
        ...prev,
        staffId: prefillStaff.staffId || prefillStaff.id || 'EMP-0012',
        staffName: prefillStaff.staffName || prefillStaff.name || 'Ajmal K'
      }));
    }
  }, [prefillStaff]);

  // Recalculate amount dynamically when hours, method, or rate changes
  useEffect(() => {
    const hrs = Number(formData.overtimeHours) || 0;
    const rateVal = Number(formData.rate) || 0;
    if (formData.calculationMethod === 'Hourly Rate') {
      setFormData((prev) => ({ ...prev, amount: (hrs * rateVal).toString() }));
    }
  }, [formData.overtimeHours, formData.rate, formData.calculationMethod]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const hrs = Number(formData.overtimeHours);
    if (!hrs || hrs <= 0) {
      setError('Please enter valid overtime hours.');
      return;
    }

    try {
      await onSave({
        ...formData,
        overtimeHours: hrs,
        rate: Number(formData.rate) || 0,
        amount: Number(formData.amount) || 0
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record overtime.');
    }
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <ResponsiveModalSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Add Overtime Record"
      maxWidth="580px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {error && (
          <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--danger-soft)', color: 'var(--danger)', fontSize: '13px', fontWeight: '600' }}>
            {error}
          </div>
        )}

        <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Staff Member *</label>
            <select
              value={formData.staffId}
              onChange={(e) => {
                const name = e.target.options[e.target.selectedIndex].text.split(' (')[0];
                setFormData({ ...formData, staffId: e.target.value, staffName: name });
              }}
              style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
            >
              <option value="EMP-0012">Ajmal K (Mechanic)</option>
              <option value="EMP-0014">Rajesh V (Branch Manager)</option>
              <option value="EMP-0015">Priya Nair (Receptionist)</option>
              <option value="EMP-0016">Suresh Kumar (Technician)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Date *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
            />
          </div>
        </div>

        <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Payroll Month *</label>
            <select
              value={formData.payrollMonth}
              onChange={(e) => setFormData({ ...formData, payrollMonth: e.target.value })}
              style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
            >
              <option value="August 2026">August 2026</option>
              <option value="September 2026">September 2026</option>
              <option value="October 2026">October 2026</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Shift *</label>
            <input
              type="text"
              required
              value={formData.shift}
              onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
              style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
            />
          </div>
        </div>

        <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Actual Clock In</label>
            <input
              type="text"
              value={formData.clockIn}
              onChange={(e) => setFormData({ ...formData, clockIn: e.target.value })}
              placeholder="e.g. 09:00 AM"
              style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Actual Clock Out</label>
            <input
              type="text"
              value={formData.clockOut}
              onChange={(e) => setFormData({ ...formData, clockOut: e.target.value })}
              placeholder="e.g. 08:30 PM"
              style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
            />
          </div>
        </div>

        <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Overtime Hours *</label>
            <input
              type="number"
              step="0.5"
              required
              placeholder="e.g. 2.5"
              value={formData.overtimeHours}
              onChange={(e) => setFormData({ ...formData, overtimeHours: e.target.value })}
              style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Calculation Method *</label>
            <select
              value={formData.calculationMethod}
              onChange={(e) => setFormData({ ...formData, calculationMethod: e.target.value })}
              style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
            >
              <option value="Hourly Rate">Hourly Rate</option>
              <option value="Fixed Amount">Fixed Amount</option>
              <option value="Manual Authorized Amount">Manual Authorized Amount</option>
            </select>
          </div>
        </div>

        <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Overtime Rate (₹ / hr)</label>
            <input
              type="number"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              placeholder="e.g. 150"
              style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Calculated Amount (₹) *</label>
            <input
              type="number"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Overtime Reason *</label>
          <input
            type="text"
            required
            placeholder="e.g. Emergency engine overhaul for JC-8812"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Manager Notes</label>
          <textarea
            rows={2}
            placeholder="Add any authorization details or internal shift remarks..."
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
            Submit Overtime
          </button>
        </div>
      </form>
    </ResponsiveModalSheet>
  );
};
