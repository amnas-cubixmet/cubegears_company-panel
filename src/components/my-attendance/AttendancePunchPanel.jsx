import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, LogIn, LogOut, MapPin, Repeat2 } from 'lucide-react';
import { attendanceService } from '../../services/attendance.service';

const modeLabel = {
  single: 'Single Punch',
  multi: 'Multi Punch',
  auto_checkout: 'Auto Checkout',
  hybrid: 'Hybrid',
};

const formatTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const durationLabel = (session, now) => {
  if (!session) return '0m';
  let minutes = Number(session.workedMinutes || 0);

  if (!session.clockOut && session.clockIn) {
    const start = new Date(session.clockIn);
    if (!Number.isNaN(start.getTime())) {
      minutes = Math.max(0, Math.floor((now - start.getTime()) / 60000));
    }
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours ? `${hours}h ${mins}m` : `${mins}m`;
};

const locationLabel = (location = {}) => {
  if (location.latitude == null || location.longitude == null) return 'No location';
  return `${Number(location.latitude).toFixed(5)}, ${Number(location.longitude).toFixed(5)}`;
};

export const AttendancePunchPanel = ({ onChanged }) => {
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());

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

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const punch = async () => {
    if (!state?.nextAction || busy) return;
    setBusy(true);
    setError('');

    try {
      await attendanceService.punchAttendance(state.nextAction, {
        locationRequired: Boolean(state?.rule?.locationRequired),
        locationTrackingEnabled: Boolean(state?.rule?.locationTrackingEnabled),
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

  const sessions = useMemo(
    () => state?.record?.sessions || [],
    [state?.record?.sessions],
  );

  if (!state && !error) {
    return <section className="attendance-punch-card is-loading">Loading attendance status…</section>;
  }

  const isIn = state?.status === 'CLOCKED_IN';
  const autoTime = formatTime(state?.autoCheckoutAt);
  const ActionIcon = state?.nextAction === 'check_out' ? LogOut : LogIn;
  const locationEnabled = Boolean(
    state?.rule?.locationTrackingEnabled || state?.rule?.locationRequired,
  );

  return (
    <section className={`attendance-punch-card ${isIn ? 'is-live' : state?.nextAction ? 'is-ready' : 'is-complete'}`}>
      <div className="attendance-punch-main">
        <div className="attendance-punch-status">
          <span className={`attendance-live-dot ${isIn ? 'is-online' : ''}`} />
          <span>
            <small>Today</small>
            <strong>{isIn ? 'Checked In' : 'Checked Out'}</strong>
          </span>
        </div>

        <div className="attendance-punch-meta">
          <div>
            <Clock3 size={13} />
            <span><small>Mode</small><strong>{modeLabel[state?.attendanceMode] || 'Attendance'}</strong></span>
          </div>
          <div>
            <Repeat2 size={13} />
            <span><small>Sessions</small><strong>{state?.sessionCount || 0}</strong></span>
          </div>
          {autoTime !== '—' && (
            <div>
              <Clock3 size={13} />
              <span><small>Auto Checkout</small><strong>{autoTime}</strong></span>
            </div>
          )}
        </div>
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

      {sessions.length > 0 && (
        <div className="attendance-session-strip">
          {sessions.map((session, index) => (
            <article key={session.id || index} className={session.clockOut ? '' : 'is-open'}>
              <div className="attendance-session-title">
                <strong>Session {index + 1}</strong>
                <span>{session.clockOut ? durationLabel(session, now) : `Live · ${durationLabel(session, now)}`}</span>
              </div>
              <div className="attendance-session-times">
                <span><small>In</small><b>{formatTime(session.clockIn)}</b></span>
                <span><small>Out</small><b>{formatTime(session.clockOut)}</b></span>
              </div>
              {locationEnabled && (
                <div className="attendance-session-location">
                  <MapPin size={11} />
                  <span>
                    {locationLabel(session.clockInLocation)}
                    {session.clockOutLocation?.latitude != null
                      ? ` → ${locationLabel(session.clockOutLocation)}`
                      : ''}
                  </span>
                </div>
              )}
              {session.autoClosed && <small className="attendance-session-auto">Auto checkout</small>}
            </article>
          ))}
        </div>
      )}

      {error && <div className="attendance-punch-error">{error}</div>}
    </section>
  );
};
