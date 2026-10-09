import React from 'react';
import { Paperclip } from 'lucide-react';

/** CubixGear Daily Wage Only: every leave day is unpaid, no Leave Type field. */
export const ApplyLeaveForm = ({
  form, setForm, submitting, onSubmit, onCancel,
}) => (
  <form className="apply-leave-form" onSubmit={onSubmit}>
    <div className="apply-leave-grid">
      <label>
        <span>Duration *</span>
        <select
          value={form.leaveMode}
          onChange={(event) => setForm((current) => ({
            ...current, leaveMode: event.target.value,
          }))}
        >
          <option>Full Day</option>
          <option>Half Day</option>
        </select>
      </label>
      <label>
        <span>Leave Date *</span>
        <input
          type="date"
          value={form.startDate}
          onChange={(event) => setForm((current) => ({
            ...current,
            startDate: event.target.value,
            endDate: event.target.value,
          }))}
          required
        />
      </label>
    </div>

    <div className="apply-leave-balance-note is-unpaid" role="note">
      All leave is unpaid. A full-day leave earns ₹0 daily wage.
      Half-day leave earns wages only for verified half-day work.
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
              onClick={() => setForm((current) => ({
                ...current, halfDaySession: session,
              }))}
            >
              {session}
            </button>
          ))}
        </div>
      </div>
    )}

    <label>
      <span>Reason *</span>
      <textarea
        rows={4}
        value={form.reason}
        onChange={(event) => setForm((current) => ({
          ...current, reason: event.target.value,
        }))}
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
          onChange={(event) => setForm((current) => ({
            ...current, attachment: event.target.files?.[0] || null,
          }))}
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
