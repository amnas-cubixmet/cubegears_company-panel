import React from 'react';
import { CalendarDays, Check, MessageSquareText, X } from 'lucide-react';
import { ResponsiveModalSheet } from '../common/ResponsiveModalSheet';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(String(value).length === 10 ? value + 'T00:00:00' : value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const LeaveApprovalSheet = ({
  item,
  decision,
  note,
  setNote,
  submitting,
  error,
  onClose,
  onSubmit,
}) => {
  const isApprove = decision === 'approve';
  const title = isApprove ? 'Approve Leave Request' : 'Reject Leave Request';

  return (
    <ResponsiveModalSheet
      isOpen={Boolean(item && decision)}
      onClose={submitting ? undefined : onClose}
      title={title}
      maxWidth="560px"
    >
      {item ? (
        <form className="leave-approval-sheet" onSubmit={onSubmit}>
          <section className="leave-approval-summary">
            <div className="leave-approval-summary__person">
              <span>{(item.staffName || 'S').slice(0, 1).toUpperCase()}</span>
              <div>
                <strong>{item.staffName || 'Staff'}</strong>
                <small>{item.staffId || 'Employee'}</small>
              </div>
            </div>

            <div className="leave-approval-summary__dates">
              <div>
                <span><CalendarDays size={12} />Start Date</span>
                <strong>{formatDate(item.startDate || item.date)}</strong>
              </div>
              <div>
                <span><CalendarDays size={12} />End Date</span>
                <strong>{formatDate(item.endDate || item.startDate || item.date)}</strong>
              </div>
              <div>
                <span>Duration</span>
                <strong>
                  {item.halfDay
                    ? 'Half Day'
                    : (Number(item.totalDays || 1) + ' Day' + (Number(item.totalDays || 1) === 1 ? '' : 's'))}
                </strong>
              </div>
            </div>

            <div className="leave-approval-summary__reason">
              <span>Reason</span>
              <strong>{item.reason || 'No reason provided.'}</strong>
            </div>
          </section>

          <label className="leave-approval-note">
            <span>
              <MessageSquareText size={13} />
              {isApprove ? 'Approval Note' : 'Rejection Reason'}
              {isApprove ? <small>Optional</small> : <small>Required</small>}
            </span>
            <textarea
              autoFocus
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={
                isApprove
                  ? 'Add a note for this approval…'
                  : 'Enter the reason for rejecting this leave request…'
              }
              required={!isApprove}
            />
          </label>

          {error ? <div className="leave-approval-error">{error}</div> : null}

          <div className="leave-approval-sheet__actions">
            <button
              type="button"
              className="am-secondary-button"
              onClick={onClose}
              disabled={submitting}
            >
              <X size={13} />
              Cancel
            </button>

            <button
              type="submit"
              className={isApprove ? 'am-approve-button' : 'am-reject-button'}
              disabled={submitting || (!isApprove && !note.trim())}
            >
              {isApprove ? <Check size={13} /> : <X size={13} />}
              {submitting
                ? 'Saving…'
                : isApprove
                  ? 'Approve Leave'
                  : 'Reject Leave'}
            </button>
          </div>
        </form>
      ) : null}
    </ResponsiveModalSheet>
  );
};
