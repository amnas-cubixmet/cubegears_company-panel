import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  Clock3,
  MapPin,
  Save,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import { AttendanceModeSelector } from '../../components/attendance-manager/AttendanceModeSelector';
import { attendanceManagerService } from '../../services/attendanceManager.service';

const defaults = {
  attendanceMode: 'single',
  startTime: '09:00',
  endTime: '18:00',
  lateGraceMinutes: 15,
  overtimeAfterMinutes: 540,
  maxSessionsPerDay: 0,
  autoCheckoutGraceMinutes: 0,
  missingPunchPolicy: 'request_correction',
  locationRequired: false,
  correctionApproval: true,
  allowSelfApproval: false,
  weekendDays: ['Sunday'],
  alternateSaturdayEnabled: false,
  alternateSaturdayPattern: '2nd & 4th Saturday',
  weekendAttendancePolicy: 'weekly_off',
  weekendEffectiveFrom: '',
};

const normalizeRules = (data = {}) => ({
  ...defaults,
  ...data,
  startTime: String(data.startTime || defaults.startTime).slice(0, 5),
  endTime: String(data.endTime || defaults.endTime).slice(0, 5),
  weekendDays: Array.isArray(data.weekendDays) ? data.weekendDays : defaults.weekendDays,
});

export const RulesSettings = () => {
  const [initialRules, setInitialRules] = useState(null);
  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadRules = async () => {
    setLoading(true);
    try {
      const data = normalizeRules(await attendanceManagerService.getRules());
      setRules(data);
      setInitialRules(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const dirty = JSON.stringify(rules) !== JSON.stringify(initialRules);

  const change = (field, value) => {
    setRules((current) => ({ ...current, [field]: value }));
  };

  const toggleWeekend = (day) => {
    const values = new Set(rules.weekendDays || []);
    if (values.has(day)) values.delete(day);
    else values.add(day);
    change('weekendDays', Array.from(values));
  };

  const save = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    setMessage('');

    try {
      const saved = normalizeRules(await attendanceManagerService.saveRules(rules));
      setRules(saved);
      setInitialRules(saved);
      setMessage('Attendance rules saved.');
    } catch (error) {
      setMessage(error?.message || 'Unable to save attendance rules.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !rules) {
    return <div className="attendance-rules-loading">Loading attendance rules…</div>;
  }

  const autoMode = ['auto_checkout', 'hybrid'].includes(rules.attendanceMode);
  const multiMode = ['multi', 'hybrid'].includes(rules.attendanceMode);

  return (
    <div className="attendance-rules-page">
      <header className="attendance-rules-header">
        <div>
          <h2>Attendance Rules</h2>
          <p>Choose how employees punch attendance and how missed punches are handled.</p>
        </div>

        <button
          type="button"
          className="attendance-rules-save"
          disabled={!dirty || saving}
          onClick={save}
        >
          <Save size={14} />
          {saving ? 'Saving…' : 'Save Rules'}
        </button>
      </header>

      {message && <div className="attendance-rules-message">{message}</div>}

      <section className="attendance-rule-section">
        <div className="attendance-rule-title">
          <Clock3 size={16} />
          <div>
            <h3>Punch Mode</h3>
            <p>Company-wide attendance behavior for check-in and check-out.</p>
          </div>
        </div>

        <AttendanceModeSelector
          value={rules.attendanceMode}
          onChange={(value) => change('attendanceMode', value)}
        />

        {multiMode && (
          <label className="attendance-rule-field">
            <span>Maximum Sessions Per Day</span>
            <small>Use 0 for unlimited sessions.</small>
            <input
              type="number"
              min="0"
              value={rules.maxSessionsPerDay}
              onChange={(event) => change('maxSessionsPerDay', Math.max(0, Number(event.target.value)))}
            />
          </label>
        )}
      </section>

      <div className="attendance-rules-columns">
        <section className="attendance-rule-section">
          <div className="attendance-rule-title">
            <Clock3 size={16} />
            <div>
              <h3>Shift Timing</h3>
              <p>Used for late calculation, overtime and automatic checkout.</p>
            </div>
          </div>

          <div className="attendance-rule-form-grid">
            <label className="attendance-rule-field">
              <span>Shift Start</span>
              <input type="time" value={rules.startTime} onChange={(e) => change('startTime', e.target.value)} />
            </label>
            <label className="attendance-rule-field">
              <span>Shift End</span>
              <input type="time" value={rules.endTime} onChange={(e) => change('endTime', e.target.value)} />
            </label>
            <label className="attendance-rule-field">
              <span>Late Grace Minutes</span>
              <input type="number" min="0" value={rules.lateGraceMinutes} onChange={(e) => change('lateGraceMinutes', Number(e.target.value))} />
            </label>
            <label className="attendance-rule-field">
              <span>Overtime After Minutes</span>
              <input type="number" min="0" value={rules.overtimeAfterMinutes} onChange={(e) => change('overtimeAfterMinutes', Number(e.target.value))} />
            </label>
            {autoMode && (
              <label className="attendance-rule-field attendance-rule-field-wide">
                <span>Auto Checkout Worker Grace</span>
                <small>System waits this many minutes before processing, but worked time closes at shift end.</small>
                <input
                  type="number"
                  min="0"
                  value={rules.autoCheckoutGraceMinutes}
                  onChange={(e) => change('autoCheckoutGraceMinutes', Number(e.target.value))}
                />
              </label>
            )}
          </div>
        </section>

        <section className="attendance-rule-section">
          <div className="attendance-rule-title">
            <TriangleAlert size={16} />
            <div>
              <h3>Missing Punch Policy</h3>
              <p>What happens if an employee forgets to check out.</p>
            </div>
          </div>

          <label className="attendance-rule-field">
            <span>Policy</span>
            <select
              value={rules.missingPunchPolicy}
              onChange={(e) => change('missingPunchPolicy', e.target.value)}
            >
              <option value="request_correction">Request Punch Correction</option>
              <option value="auto_close">Auto Close at Shift End</option>
              <option value="mark_missing">Keep as Missing Clock Out</option>
            </select>
          </label>

          <label className="attendance-rule-toggle">
            <span>
              <strong>Correction Requires Approval</strong>
              <small>Manager must approve employee punch corrections.</small>
            </span>
            <input
              type="checkbox"
              checked={Boolean(rules.correctionApproval)}
              onChange={(e) => change('correctionApproval', e.target.checked)}
            />
          </label>

          <label className="attendance-rule-toggle">
            <span>
              <strong>Prevent Manager Self-Approval</strong>
              <small>Recommended for audit safety.</small>
            </span>
            <input
              type="checkbox"
              checked={!rules.allowSelfApproval}
              onChange={(e) => change('allowSelfApproval', !e.target.checked)}
            />
          </label>
        </section>

        <section className="attendance-rule-section">
          <div className="attendance-rule-title">
            <MapPin size={16} />
            <div>
              <h3>Punch Security</h3>
              <p>Optional controls for attendance punches.</p>
            </div>
          </div>

          <label className="attendance-rule-toggle">
            <span>
              <strong>Require Device Location</strong>
              <small>Check-in/out is rejected when browser location is unavailable.</small>
            </span>
            <input
              type="checkbox"
              checked={Boolean(rules.locationRequired)}
              onChange={(e) => change('locationRequired', e.target.checked)}
            />
          </label>
        </section>

        <section className="attendance-rule-section">
          <div className="attendance-rule-title">
            <CalendarDays size={16} />
            <div>
              <h3>Weekly Off</h3>
              <p>Configure non-working days and optional attendance.</p>
            </div>
          </div>

          <div className="attendance-weekdays">
            {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((day) => (
              <button
                key={day}
                type="button"
                className={(rules.weekendDays || []).includes(day) ? 'is-selected' : ''}
                onClick={() => toggleWeekend(day)}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>

          <label className="attendance-rule-field">
            <span>Weekly Off Attendance Policy</span>
            <select value={rules.weekendAttendancePolicy} onChange={(e) => change('weekendAttendancePolicy', e.target.value)}>
              <option value="weekly_off">Block Attendance / Weekly Off</option>
              <option value="allow">Allow Attendance</option>
              <option value="allow_overtime">Allow Attendance + Overtime</option>
            </select>
          </label>

          <label className="attendance-rule-toggle">
            <span>
              <strong>Alternate Saturday</strong>
              <small>Apply a recurring Saturday off pattern.</small>
            </span>
            <input
              type="checkbox"
              checked={Boolean(rules.alternateSaturdayEnabled)}
              onChange={(e) => change('alternateSaturdayEnabled', e.target.checked)}
            />
          </label>

          {rules.alternateSaturdayEnabled && (
            <label className="attendance-rule-field">
              <span>Saturday Pattern</span>
              <select value={rules.alternateSaturdayPattern} onChange={(e) => change('alternateSaturdayPattern', e.target.value)}>
                <option>1st & 3rd Saturday</option>
                <option>2nd & 4th Saturday</option>
                <option>1st, 3rd & 5th Saturday</option>
                <option>All Saturdays</option>
              </select>
            </label>
          )}

          <label className="attendance-rule-field">
            <span>Effective From</span>
            <input
              type="date"
              value={rules.weekendEffectiveFrom || ''}
              onChange={(e) => change('weekendEffectiveFrom', e.target.value)}
            />
          </label>
        </section>
      </div>

      <section className="attendance-rule-note">
        <ShieldCheck size={16} />
        <span>
          Rules are enforced by the backend API, not only hidden in the UI. Employees cannot bypass punch mode restrictions by calling the endpoint directly.
        </span>
      </section>
    </div>
  );
};
