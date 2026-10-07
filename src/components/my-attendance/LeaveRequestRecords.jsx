import React from 'react';
import { CalendarDays, X } from 'lucide-react';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatSubmitted = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const statusTone = (status = '') => {
  const value = String(status).toLowerCase();
  if (value === 'approved') return 'is-success';
  if (value === 'pending') return 'is-warning';
  if (value === 'cancelled') return 'is-neutral';
  return 'is-danger';
};

export const LeaveRequestRecords = ({ requests, onCancel }) => (
  <section className="leave-records-card">
    <header className="leave-records-header">
      <div>
        <h3>Leave Application Records</h3>
        <p>Submitted applications and approval status.</p>
      </div>
      <span>{requests.length} request{requests.length === 1 ? '' : 's'}</span>
    </header>

    <div className="leave-request-mobile-list">
      {requests.map((request) => (
        <article key={request.id} className="leave-request-mobile-card">
          <div className="leave-request-mobile-head">
            <div>
              <strong>{request.type}</strong>
              <span>{request.leaveMode}</span>
            </div>
            <span className={`leave-status-pill ${statusTone(request.status)}`}>
              {request.status}
            </span>
          </div>

          <div className="leave-request-date">
            <CalendarDays size={13} />
            <span>
              {formatDate(request.startDate)}
              {request.endDate && request.endDate !== request.startDate
                ? ` – ${formatDate(request.endDate)}`
                : ''}
            </span>
            <b>{request.daysCount} day{request.daysCount === 1 ? '' : 's'}</b>
          </div>

          <div className="leave-request-reason">
            <small>Reason</small>
            <span>{request.reason}</span>
          </div>

          <footer className="leave-request-mobile-footer">
            <span>Submitted {formatSubmitted(request.submittedAt)}</span>
            {request.canCancel && request.status === 'Pending' && (
              <button type="button" onClick={() => onCancel(request.id)}>
                <X size={12} />
                Cancel
              </button>
            )}
          </footer>
        </article>
      ))}
    </div>

    <div className="leave-request-table-wrap">
      <table className="leave-request-table">
        <thead>
          <tr>
            <th>Leave Type</th>
            <th>Dates</th>
            <th>Duration</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Submitted</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>
                <strong>{request.type}</strong>
                <span>{request.leaveMode}</span>
              </td>
              <td>
                {formatDate(request.startDate)}
                {request.endDate && request.endDate !== request.startDate
                  ? ` → ${formatDate(request.endDate)}`
                  : ''}
              </td>
              <td>{request.daysCount} day{request.daysCount === 1 ? '' : 's'}</td>
              <td className="leave-reason-cell">{request.reason}</td>
              <td>
                <span className={`leave-status-pill ${statusTone(request.status)}`}>
                  {request.status}
                </span>
              </td>
              <td>{formatSubmitted(request.submittedAt)}</td>
              <td>
                {request.canCancel && request.status === 'Pending' ? (
                  <button
                    type="button"
                    className="leave-cancel-button"
                    onClick={() => onCancel(request.id)}
                  >
                    Cancel
                  </button>
                ) : (
                  <span className="leave-no-action">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {!requests.length && (
      <div className="leave-records-empty">No leave requests found.</div>
    )}
  </section>
);
