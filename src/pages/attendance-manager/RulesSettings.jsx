import React, { useState, useEffect } from 'react';
import { Save, Clock, ShieldAlert, CalendarDays } from 'lucide-react';
import { attendanceManagerService } from '../../services/attendanceManager.service';

export const RulesSettings = () => {
  const [initialRules, setInitialRules] = useState(null);
  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await attendanceManagerService.getRules();
      setInitialRules(data);
      setRules({ ...data });
      setIsDirty(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    const updated = { ...rules, [field]: value };
    setRules(updated);
    const dirty = JSON.stringify(updated) !== JSON.stringify(initialRules);
    setIsDirty(dirty);
  };

  const toggleWeekendDay = (day) => {
    const currentDays = Array.isArray(rules.weekendDays) ? rules.weekendDays : [];
    const nextDays = currentDays.includes(day)
      ? currentDays.filter((item) => item !== day)
      : [...currentDays, day];

    handleChange('weekendDays', nextDays);
  };

  const handleSaveRules = async (e) => {
    if (e) e.preventDefault();
    if (!isDirty || saving) return;

    setSaving(true);
    try {
      await attendanceManagerService.saveRules(rules);
      setInitialRules({ ...rules });
      setIsDirty(false);
      setToastMsg('Attendance rules saved successfully.');
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !rules) {
    return <div style={{ padding: '20px', color: 'var(--text-muted)' }}>Loading attendance rules...</div>;
  }

  return (
    <div className="attendance-manager-module attendance-manager-rules" style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* Toast Feedback */}
      {toastMsg && (
        <div style={{
          backgroundColor: 'var(--success)',
          color: '#ffffff',
          padding: '10px 14px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {toastMsg}
        </div>
      )}

      {/* Header layout */}
      <div className="rules-header am-section-header am-rules-header" style={{
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, lineHeight: 1.25 }}>
              Shift & Attendance Rules Config
            </h3>
            {isDirty && (
              <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: 'var(--warning-soft)', color: 'var(--warning)', padding: '2px 6px', borderRadius: '4px' }}>
                Unsaved changes
              </span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.5, width: '100%', maxWidth: '100%' }}>
            Grouped category configuration for shifts, grace time, and approval permissions.
          </p>
        </div>

        <button
          type="button"
          disabled={!isDirty || saving}
          onClick={handleSaveRules}
          className="save-rules-btn"
          style={{
            height: '46px',
            padding: '0 16px',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            borderRadius: '10px',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            border: 'none',
            fontSize: '13px',
            fontWeight: '700',
            cursor: isDirty && !saving ? 'pointer' : 'not-allowed',
            opacity: isDirty && !saving ? 1 : 0.6
          }}
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save Rules'}
        </button>
      </div>

      {/* Grouped Settings Cards */}
      <div className="am-rules-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', width: '100%' }}>
        {/* Category 1: Shift & Grace */}
        <div className="am-rule-card" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} style={{ color: 'var(--primary)' }} /> Shift Timing & Grace Minutes
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '4px' }}>Shift Start Time</label>
              <input
                type="text"
                value={rules.startTime || ''}
                onChange={(e) => handleChange('startTime', e.target.value)}
                style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '4px' }}>Shift End Time</label>
              <input
                type="text"
                value={rules.endTime || ''}
                onChange={(e) => handleChange('endTime', e.target.value)}
                style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '4px' }}>Late Grace Minutes</label>
              <input
                type="number"
                value={rules.lateGraceMinutes || 15}
                onChange={(e) => handleChange('lateGraceMinutes', Number(e.target.value))}
                style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
        </div>

        {/* Category 2: Missing Punch Policy */}
        <div className="am-rule-card" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} style={{ color: 'var(--warning)' }} /> Missing Punch Rules
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '4px' }}>Missing Punch Policy</label>
              <input
                type="text"
                value={rules.missingPunchPolicy || ''}
                onChange={(e) => handleChange('missingPunchPolicy', e.target.value)}
                style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
        </div>

        {/* Category 3: Weekend Off */}
        <div className="am-rule-card" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CalendarDays size={16} style={{ color: 'var(--primary)' }} /> Weekend Off Settings
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '6px' }}>
                Weekly Off Days
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '6px' }}>
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                  const selected = Array.isArray(rules.weekendDays) && rules.weekendDays.includes(day);

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleWeekendDay(day)}
                      style={{
                        minHeight: '36px',
                        padding: '0 8px',
                        borderRadius: '8px',
                        border: selected ? '1px solid var(--primary)' : '1px solid var(--border)',
                        backgroundColor: selected ? 'var(--primary-soft)' : 'var(--surface-2)',
                        color: selected ? 'var(--primary)' : 'var(--text-secondary)',
                        fontSize: '11px',
                        fontWeight: selected ? '700' : '600',
                        cursor: 'pointer'
                      }}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--surface-2)' }}>
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: '700' }}>Alternate Saturday Off</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
                  Apply a recurring Saturday-off pattern.
                </div>
              </div>

              <input
                type="checkbox"
                checked={Boolean(rules.alternateSaturdayEnabled)}
                onChange={(e) => handleChange('alternateSaturdayEnabled', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0 }}
              />
            </div>

            {rules.alternateSaturdayEnabled && (
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '4px' }}>
                  Saturday Pattern
                </label>
                <select
                  value={rules.alternateSaturdayPattern || '2nd & 4th Saturday'}
                  onChange={(e) => handleChange('alternateSaturdayPattern', e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                >
                  <option>1st & 3rd Saturday</option>
                  <option>2nd & 4th Saturday</option>
                  <option>1st, 3rd & 5th Saturday</option>
                  <option>All Saturdays</option>
                </select>
              </div>
            )}

            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '4px' }}>
                Weekend Attendance Policy
              </label>
              <select
                value={rules.weekendAttendancePolicy || 'Mark as Weekly Off'}
                onChange={(e) => handleChange('weekendAttendancePolicy', e.target.value)}
                style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              >
                <option>Mark as Weekly Off</option>
                <option>Allow Attendance</option>
                <option>Allow Attendance + Overtime</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '4px' }}>
                Effective From
              </label>
              <input
                type="date"
                value={rules.weekendEffectiveFrom || ''}
                onChange={(e) => handleChange('weekendEffectiveFrom', e.target.value)}
                style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
        </div>

        {/* Category 4: Permissions Guard */}
        <div className="am-rule-card" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={16} style={{ color: 'var(--danger)' }} /> Approval Permissions Guard
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'var(--surface-2)', borderRadius: '8px' }}>
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Prevent Manager Self-Approval</span>
              <input
                type="checkbox"
                checked={!rules.allowSelfApproval}
                onChange={(e) => handleChange('allowSelfApproval', !e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};
