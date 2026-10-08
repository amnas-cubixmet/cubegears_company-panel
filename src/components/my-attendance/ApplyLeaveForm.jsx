import React from 'react';
import { Paperclip } from 'lucide-react';

export const ApplyLeaveForm = ({
  balances,
  form,
  setForm,
  submitting,
  onSubmit,
  onCancel,
}) => {
  const leaveTypes = balances.map((item) => item.type);
  const selectedBalance = balances.find((item) => item.type === form.leaveType) || null;
  const halfDayAllowed = selectedBalance?.halfDayAllowed !== false;

  return (
    <form className="apply-leave-form" onSubmit={onSubmit}>
      <div className="apply-leave-grid">
        <label>
          <span>Leave Type *</span>
          <select
            value={form.leaveType}
            disabled={!leaveTypes.length}
            onChange={(event) =>
              setForm((current) => ({ ...current, leaveType: event.target.value }))
            }
          >
            {!leaveTypes.length && <option value="">No leave type configured</option>}
            {leaveTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>

        <label>
          <span>Duration *</span>
          <select
            value={form.leaveMode}
            onChange={(event) =>
              setForm((current) => ({ ...current, leaveMode: event.target.value }))
            }
          >
            <option>Full Day</option>
            {halfDayAllowed && <option>Half Day</option>}
          </select>
        </label>
      </div>

      {selectedBalance && (
        <div className="apply-leave-balance-note">
          <span>
            Available <strong>{selectedBalance.available}</strong> day(s)
            {' · '}
            {selectedBalance.allocationPeriod === 'month' ? 'Monthly' : 'Annual'} allocation
          </span>
        </div>
      )}

      {form.leaveMode === 'Half Day' && halfDayAllowed && (
        <div className="apply-half-day">
          <span>Half Day Session</span>
          <div>
            {['First Half', 'Second Half'].map((session) => (
              <button
                key={session}
                type="button"
                className={form.halfDaySession === session ? 'is-active' : ''}
                onClick={() =>
                  setForm((current) => ({ ...current, halfDaySession: session }))
                }
              >
                {session}
              </button>
            ))}
          </div>
        </div>
      )}

      <label>
        <span>Leave Date *</span>
        <input
          type="date"
          value={form.startDate}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              startDate: event.target.value,
              endDate: event.target.value,
            }))
          }
          required
        />
      </label>

      <label>
        <span>Reason *</span>
        <textarea
          rows={4}
          value={form.reason}
          onChange={(event) =>
            setForm((current) => ({ ...current, reason: event.target.value }))
          }
          placeholder="Enter the reason for leave..."
          required
        />
      </label>

      <label className="apply-leave-file">
        <span>Attachment</span>
        <div>
          <Paperclip size={14} />
          <input
            type="file"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                attachment: event.target.files?.[0] || null,
              }))
            }
          />
        </div>
        {form.attachment && <small>{form.attachment.name}</small>}
      </label>

      <div className="apply-leave-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit" className="is-primary" disabled={submitting || !leaveTypes.length}>
          {submitting ? 'Submitting…' : 'Submit Application'}
        </button>
      </div>
    </form>
  );
};
