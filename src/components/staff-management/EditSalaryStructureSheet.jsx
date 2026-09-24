import React, { useEffect, useState } from 'react';
import { ResponsiveModalSheet } from '../common/ResponsiveModalSheet';
import { Save } from 'lucide-react';

const today = () => new Date().toISOString().split('T')[0];

export const EditSalaryStructureSheet = ({ isOpen, onClose, structure, onSave }) => {
  const [formData, setFormData] = useState({
    staffId: '',
    staffName: '',
    salaryBasis: 'Fixed Monthly',
    fixedMonthlySalary: '',
    hourlyRate: '',
    dailyRate: '',
    allowances: '',
    fixedIncentives: '',
    effectiveDate: today(),
    endDate: '',
    notes: '',
    status: 'Active'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!structure) return;
    setFormData({
      id: structure.id,
      staffId: structure.staffId || '',
      staffName: structure.staffName || '',
      salaryBasis: structure.salaryBasis === 'Monthly' ? 'Fixed Monthly' : (structure.salaryBasis || 'Fixed Monthly'),
      fixedMonthlySalary: structure.fixedMonthlySalary ?? structure.basicSalary ?? '',
      hourlyRate: structure.hourlyRate ?? '',
      dailyRate: structure.dailyRate ?? '',
      allowances: structure.allowances ?? '',
      fixedIncentives: structure.fixedIncentives ?? '',
      effectiveDate: structure.effectiveDate || today(),
      endDate: structure.endDate || '',
      notes: structure.notes || '',
      status: structure.status || 'Active'
    });
  }, [structure, isOpen]);

  if (!isOpen || !structure) return null;

  const set = (key, value) => setFormData((old) => ({ ...old, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const basis = formData.salaryBasis;
    const fixedMonthlySalary = basis === 'Fixed Monthly' ? Number(formData.fixedMonthlySalary || 0) : 0;
    const hourlyRate = basis === 'Hourly' ? Number(formData.hourlyRate || 0) : 0;
    const dailyRate = basis === 'Daily' ? Number(formData.dailyRate || 0) : 0;

    setSaving(true);
    try {
      await onSave({
        ...formData,
        fixedMonthlySalary,
        hourlyRate,
        dailyRate,
        basicSalary: fixedMonthlySalary,
        allowances: Number(formData.allowances || 0),
        fixedIncentives: Number(formData.fixedIncentives || 0)
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%',
    height: '46px',
    padding: '0 12px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--surface-2)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginBottom: '4px'
  };

  return (
    <ResponsiveModalSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Salary Structure: ${formData.staffName}`}
      maxWidth="620px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={labelStyle}>Staff Member</label>
          <input type="text" disabled value={formData.staffName} style={{ ...inputStyle, color: 'var(--text-muted)' }} />
        </div>

        <div>
          <label style={labelStyle}>Salary Type *</label>
          <select required value={formData.salaryBasis} onChange={(e) => set('salaryBasis', e.target.value)} style={inputStyle}>
            <option value="Fixed Monthly">Fixed Monthly Salary</option>
            <option value="Hourly">Per Hour</option>
            <option value="Daily">Per Day</option>
            <option value="Commission Only">Commission Only</option>
          </select>
          <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            {formData.salaryBasis === 'Fixed Monthly' && 'Pays the same base salary each month. Attendance can still be used for deductions if configured.'}
            {formData.salaryBasis === 'Hourly' && 'Base pay = approved worked hours × hourly rate.'}
            {formData.salaryBasis === 'Daily' && 'Base pay = approved present days × daily rate.'}
            {formData.salaryBasis === 'Commission Only' && 'No fixed base pay. Approved commission entries form the salary.'}
          </div>
        </div>

        {formData.salaryBasis === 'Fixed Monthly' && (
          <div>
            <label style={labelStyle}>Fixed Monthly Salary (₹) *</label>
            <input type="number" min="0" required value={formData.fixedMonthlySalary} onChange={(e) => set('fixedMonthlySalary', e.target.value)} style={inputStyle} />
          </div>
        )}

        {formData.salaryBasis === 'Hourly' && (
          <div>
            <label style={labelStyle}>Hourly Rate (₹ / hour) *</label>
            <input type="number" min="0" step="0.01" required value={formData.hourlyRate} onChange={(e) => set('hourlyRate', e.target.value)} style={inputStyle} />
          </div>
        )}

        {formData.salaryBasis === 'Daily' && (
          <div>
            <label style={labelStyle}>Daily Rate (₹ / day) *</label>
            <input type="number" min="0" step="0.01" required value={formData.dailyRate} onChange={(e) => set('dailyRate', e.target.value)} style={inputStyle} />
          </div>
        )}

        {formData.salaryBasis !== 'Commission Only' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Allowances (₹)</label>
              <input type="number" min="0" value={formData.allowances} onChange={(e) => set('allowances', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Fixed Incentives (₹)</label>
              <input type="number" min="0" value={formData.fixedIncentives} onChange={(e) => set('fixedIncentives', e.target.value)} style={inputStyle} />
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Effective Date *</label>
            <input type="date" required value={formData.effectiveDate} onChange={(e) => set('effectiveDate', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>End Date</label>
            <input type="date" value={formData.endDate} onChange={(e) => set('endDate', e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Status</label>
          <select value={formData.status} onChange={(e) => set('status', e.target.value)} style={inputStyle}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Notes / Adjustments</label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Reason for salary structure or revision..."
            style={{ ...inputStyle, height: 'auto', minHeight: '86px', padding: '10px 12px', resize: 'vertical' }}
          />
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border)',
          paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'var(--surface)'
        }}>
          <button type="button" onClick={onClose} className="secondary-button" style={{ flex: 1 }}>Cancel</button>
          <button type="submit" disabled={saving} className="primary-button" style={{ flex: 1 }}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Structure'}
          </button>
        </div>
      </form>
    </ResponsiveModalSheet>
  );
};
