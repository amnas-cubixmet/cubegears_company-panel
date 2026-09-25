import React, { useState } from 'react';
import { ResponsiveModalSheet } from '../common/ResponsiveModalSheet';
import { Save, AlertCircle } from 'lucide-react';

export const RecordPaymentSheet = ({ isOpen, onClose, payroll, onSave }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Bank Transfer');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [remarks, setRemarks] = useState('');
  const [transferStatus, setTransferStatus] = useState('Successful');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !payroll) return null;

  const paidAmount = payroll.paidAmount || 0;
  const balance = payroll.netSalary - paidAmount;

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('Please enter a valid payment amount.');
      return;
    }

    if (numAmount > balance) {
      setErrorMsg(`Payment amount (${formatINR(numAmount)}) exceeds remaining balance (${formatINR(balance)}).`);
      return;
    }

    setSaving(true);
    try {
      await onSave(payroll.id, {
        amount: numAmount,
        method,
        date,
        reference,
        remarks,
        transferStatus
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to record payment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveModalSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Record Salary Payment"
      maxWidth="500px"
    >
      <form className="payroll-sheet-form payroll-payment-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Error Alert */}
        {errorMsg && (
          <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--danger-soft)', color: 'var(--danger)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {/* Read-Only Summary Banner */}
        <div style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>{payroll.staffName}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Period: {payroll.month}</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '6px', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px', fontSize: '12px' }}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Approved Salary</span>
              <strong style={{ color: 'var(--text-primary)' }}>{formatINR(payroll.netSalary)}</strong>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Already Paid</span>
              <strong style={{ color: 'var(--success)' }}>{formatINR(paidAmount)}</strong>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Balance</span>
              <strong style={{ color: 'var(--warning)' }}>{formatINR(balance)}</strong>
            </div>
          </div>
        </div>

        {/* Form Controls */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Payment Amount (₹) *
          </label>
          <input
            type="number"
            required
            max={balance}
            placeholder={`Max: ${formatINR(balance)}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Payment Method *
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
          >
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Payment Date *
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Transfer / Reference Number
          </label>
          <input
            type="text"
            placeholder="e.g. UTR/1829301823"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Transfer Status
          </label>
          <select
            value={transferStatus}
            onChange={(e) => setTransferStatus(e.target.value)}
            style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
          >
            <option value="Successful">Successful</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Remarks
          </label>
          <input
            type="text"
            placeholder="Optional settlement notes..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Sticky Action Footer */}
        <div style={{
          display: 'flex',
          gap: '12px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border)',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'var(--surface)'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{ flex: 1, height: '46px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{ flex: 1, height: '46px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--success)', color: '#ffffff', fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Save size={16} /> {saving ? 'Recording...' : 'Record Payment'}
          </button>
        </div>
      </form>
    </ResponsiveModalSheet>
  );
};
