import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, LogIn, LogOut, Repeat2 } from 'lucide-react';
import { attendanceService } from '../../services/attendance.service';

const modeLabel = {
  single: 'Single Punch',
  multi: 'Multi Punch',
  auto_checkout: 'Auto Checkout',
  hybrid: 'Hybrid',
};

const formatTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const AttendancePunchPanel = ({ onChanged }) => {
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await attendanceService.getAttendanceStatus();
      setState(data);
      setError('');
    } catch (err) {
      setError(err?.message || 'Unable to load attendance status.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const punch = async () => {
    if (!state?.nextAction || busy) return;
    setBusy(true);
    setError('');

    try {
      await attendanceService.punchAttendance(state.nextAction, {
        locationRequired: Boolean(state?.rule?.locationRequired),
        attendanceMode: state?.attendanceMode,
      });
      await load();
      onChanged?.();
    } catch (err) {
      setError(err?.message || 'Attendance punch failed.');
    } finally {
      setBusy(false);
    }
  };

  if (!state && !error) {
    return <section className="attendance-punch-card is-loading">Loading attendance status…</section>;
  }

  const isIn = state?.status === 'CLOCKED_IN';
  const autoTime = formatTime(state?.autoCheckoutAt);
  const ActionIcon = state?.nextAction === 'check_out' ? LogOut : LogIn;

  return (
    <section className={`attendance-punch-card ${isIn ? 'is-live' : state?.nextAction ? 'is-ready' : 'is-complete'}`}>
      <div className="attendance-punch-status">
        <span className={`attendance-live-dot ${isIn ? 'is-online' : ''}`} />
        <span>
          <small>Today</small>
          <strong>{isIn ? 'Checked In' : 'Checked Out'}</strong>
        </span>
      </div>

      <div className="attendance-punch-meta">
        <div>
          <Clock3 size={14} />
          <span><small>Mode</small><strong>{modeLabel[state?.attendanceMode] || 'Attendance'}</strong></span>
        </div>
        <div>
          <Repeat2 size={14} />
          <span><small>Sessions</small><strong>{state?.sessionCount || 0}</strong></span>
        </div>
        {autoTime && (
          <div>
            <Clock3 size={14} />
            <span><small>Auto Checkout</small><strong>{autoTime}</strong></span>
          </div>
        )}
      </div>

      <div className="attendance-punch-action">
        {state?.nextAction ? (
          <button
            type="button"
            className={state.nextAction === 'check_out' ? 'is-checkout' : ''}
            disabled={busy}
            onClick={punch}
          >
            <ActionIcon size={14} />
            {busy ? 'Please wait…' : state.nextAction === 'check_out' ? 'Check Out' : 'Check In'}
          </button>
        ) : (
          <div className="attendance-punch-note">
            <CheckCircle2 size={14} />
            <span>{state?.reason || (isIn ? 'Automatic checkout is active.' : 'Attendance completed for today.')}</span>
          </div>
        )}
      </div>

      {error && <div className="attendance-punch-error">{error}</div>}
    </section>
  );
};
