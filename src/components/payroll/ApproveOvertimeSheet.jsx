import React, { useEffect, useMemo, useState } from 'react';
import { ResponsiveModalSheet } from '../common/ResponsiveModalSheet';

export const ApproveOvertimeSheet = ({
  isOpen,
  request,
  onClose,
  onApprove,
}) => {
  const [rate, setRate] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !request) return;
    setRate(Number(request.rate || 0) > 0 ? String(request.rate) : '');
    setNote('');
    setError('');
  }, [isOpen, request]);

  const hours = Number(
    request?.overtimeHours ?? ((Number(request?.minutes || 0)) / 60),
  ) || 0;

  const amount = useMemo(
    () => hours * (Number(rate) || 0),
    [hours, rate],
  );

  const submit = async (event) => {
    event.preventDefault();
    const numericRate = Number(rate);

    if (!numericRate || numericRate <= 0) {
      setError('Enter the approved overtime rate per hour.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onApprove({
        rate: numericRate,
        managerNote: note.trim(),
      });
      onClose();
    } catch (err) {
      setError(err?.message || 'Unable to approve overtime.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ResponsiveModalSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Approve Overtime & Set Rate"
      maxWidth="520px"
    >
      {request && (
        <form className="overtime-entry-form" onSubmit={submit}>
          {error && <div className="overtime-entry-error">{error}</div>}

          <div className="overtime-approval-summary">
            <div>
              <span>Staff</span>
              <strong>{request.staffName}</strong>
            </div>
            <div>
              <span>Date</span>
              <strong>{request.date || '—'}</strong>
            </div>
            <div>
              <span>Approved Hours</span>
              <strong>{hours}h</strong>
            </div>
          </div>

          <label>
            <span>Overtime Rate (₹ / hour) *</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
              placeholder="e.g. 150"
              required
              autoFocus
            />
          </label>

          <div className="overtime-approved-amount">
            <span>Approved Overtime Amount</span>
            <strong>
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 2,
              }).format(amount)}
            </strong>
            <small>{hours}h × ₹{Number(rate || 0).toFixed(2)}/hr</small>
          </div>

          <label>
            <span>Manager Note</span>
            <textarea
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional approval note..."
            />
          </label>

          <div className="overtime-entry-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="is-primary" disabled={submitting}>
              {submitting ? 'Approving…' : 'Approve Overtime'}
            </button>
          </div>
        </form>
      )}
    </ResponsiveModalSheet>
  );
};
