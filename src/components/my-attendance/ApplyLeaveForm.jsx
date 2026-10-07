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
  const leaveTypes = balances.length
    ? balances.map((item) => item.type)
    : ['Casual Leave', 'Sick Leave', 'Annual Leave'];

  return (
    <form className="apply-leave-form" onSubmit={onSubmit}>
      <div className="apply-leave-grid">
        <label>
          <span>Leave Type *</span>
          <select
            value={form.leaveType}
            onChange={(event) =>
              setForm((current) => ({ ...current, leaveType: event.target.value }))
            }
          >
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
            <option>Half Day</option>
          </select>
        </label>
      </div>

      {form.leaveMode === 'Half Day' && (
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

      <div className="apply-leave-grid">
        <label>
          <span>Start Date *</span>
          <input
            type="date"
            value={form.startDate}
            onChange={(event) =>
              setForm((current) => ({ ...current, startDate: event.target.value }))
            }
            required
          />
        </label>

        <label>
          <span>End Date *</span>
          <input
            type="date"
            min={form.startDate || undefined}
            value={form.endDate}
            onChange={(event) =>
              setForm((current) => ({ ...current, endDate: event.target.value }))
            }
            required
          />
        </label>
      </div>

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
        <button type="submit" className="is-primary" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit Application'}
        </button>
      </div>
    </form>
  );
};
