import React, { useEffect, useMemo, useState } from 'react';
import { Clock3, Plus, X } from 'lucide-react';
import { attendanceService } from '../../services/attendance.service';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const OvertimeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    overtimeHours: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    const rows = await attendanceService.getMyOvertimeRequests();
    setRequests(Array.isArray(rows) ? rows : []);
  };

  useEffect(() => {
    load();
  }, []);

  const pending = useMemo(
    () => requests.filter((row) => row.status === 'Pending').length,
    [requests],
  );

  const submit = async (event) => {
    event.preventDefault();
    if (!form.overtimeHours || Number(form.overtimeHours) <= 0) return;

    setSubmitting(true);
    setMessage('');
    try {
      await attendanceService.submitOvertimeRequest({
        date: form.date,
        overtimeHours: Number(form.overtimeHours),
        reason: form.reason.trim(),
      });
      setForm((current) => ({ ...current, overtimeHours: '', reason: '' }));
      setMessage('Overtime request submitted.');
      await load();
    } catch (error) {
      setMessage(error?.message || 'Unable to submit overtime request.');
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = async (id) => {
    await attendanceService.cancelOvertimeRequest(id);
    await load();
  };

  return (
    <div className="my-overtime-page">
      <section className="my-overtime-header">
        <div>
          <h2>Overtime Requests</h2>
          <p>Submit overtime worked and track manager approval.</p>
        </div>
        <span>{pending} Pending</span>
      </section>

      {message && <div className="my-overtime-message">{message}</div>}

      <section className="my-overtime-layout">
        <form className="my-overtime-form" onSubmit={submit}>
          <header>
            <Clock3 size={15} />
            <div>
              <h3>Request Overtime</h3>
              <p>Enter the date, overtime duration and reason.</p>
            </div>
          </header>

          <div className="my-overtime-grid">
            <label>
              <span>Date</span>
              <input
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm((current) => ({ ...current, date: event.target.value }))
                }
                required
              />
            </label>

            <label>
              <span>Overtime Hours</span>
              <input
                type="number"
                min="0.25"
                step="0.25"
                value={form.overtimeHours}
                onChange={(event) =>
                  setForm((current) => ({ ...current, overtimeHours: event.target.value }))
                }
                placeholder="2.5"
                required
              />
            </label>
          </div>

          <label>
            <span>Reason</span>
            <textarea
              rows={4}
              value={form.reason}
              onChange={(event) =>
                setForm((current) => ({ ...current, reason: event.target.value }))
              }
              placeholder="Job completion, emergency work, delivery support..."
            />
          </label>

          <button type="submit" disabled={submitting}>
            <Plus size={13} />
            {submitting ? 'Submitting…' : 'Submit Request'}
          </button>
        </form>

        <section className="my-overtime-records">
          <header>
            <div>
              <h3>Request History</h3>
              <p>Your overtime approval records.</p>
            </div>
            <span>{requests.length}</span>
          </header>

          <div className="my-overtime-list">
            {requests.map((row) => (
              <article key={row.id}>
                <div className="my-overtime-list-head">
                  <div>
                    <strong>{formatDate(row.date)}</strong>
                    <span>{row.overtimeHours ?? ((row.minutes || 0) / 60)} hours</span>
                  </div>
                  <b className={`is-${String(row.status || '').toLowerCase()}`}>
                    {row.status}
                  </b>
                </div>

                <p>{row.reason || 'No reason provided.'}</p>

                <footer>
                  <span>{row.rejectionReason || row.approvedBy || 'Awaiting manager review'}</span>
                  {row.status === 'Pending' && (
                    <button type="button" onClick={() => cancel(row.id)}>
                      <X size={12} />
                      Cancel
                    </button>
                  )}
                </footer>
              </article>
            ))}

            {!requests.length && (
              <div className="my-overtime-empty">No overtime requests yet.</div>
            )}
          </div>
        </section>
      </section>
    </div>
  );
};
