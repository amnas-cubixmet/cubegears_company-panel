import React, { useEffect, useState } from 'react';
import { Clock3, Save } from 'lucide-react';
import { attendanceManagerService } from '../../services/attendanceManager.service';

export const ShiftSettings = () => {
  const [rules, setRules] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    attendanceManagerService.getRules().then((data) => setRules(data));
  }, []);

  if (!rules) return <div className="am-loading-state">Loading shifts...</div>;

  const set = (key, value) => setRules((old) => ({ ...old, [key]: value }));

  const save = async () => {
    setSaving(true);
    try { await attendanceManagerService.saveRules(rules); }
    finally { setSaving(false); }
  };

  return (
    <div className="attendance-manager-module attendance-manager-shifts">
      <section className="am-section-header">
        <div>
          <h2><Clock3 size={17}/> Shift Settings</h2>
          <p>Shift time drives late, early exit, working hours and overtime calculations.</p>
        </div>
        <button onClick={save} className="am-primary-button">
          <Save size={15}/>{saving ? 'Saving...' : 'Save Shift'}
        </button>
      </section>

      <div className="am-two-column-grid">
        <section className="am-panel">
          <div className="am-panel__header"><h2>General Workshop Shift</h2></div>
          <div className="am-form-grid am-form-grid--2">
            <label>Start Time
              <input value={rules.startTime || ''} onChange={(e)=>set('startTime',e.target.value)}/>
            </label>
            <label>End Time
              <input value={rules.endTime || ''} onChange={(e)=>set('endTime',e.target.value)}/>
            </label>
            <label>Break Minutes
              <input type="number" min="0" value={rules.breakMinutes ?? 60} onChange={(e)=>set('breakMinutes',Number(e.target.value))}/>
            </label>
            <label>Late Grace
              <input type="number" min="0" value={rules.lateGraceMinutes ?? 15} onChange={(e)=>set('lateGraceMinutes',Number(e.target.value))}/>
            </label>
            <label>Early Exit Threshold
              <input type="number" min="0" value={rules.earlyExitThreshold ?? 15} onChange={(e)=>set('earlyExitThreshold',Number(e.target.value))}/>
            </label>
            <label>OT Starts After (min)
              <input type="number" min="0" value={rules.overtimeThreshold ?? 60} onChange={(e)=>set('overtimeThreshold',Number(e.target.value))}/>
            </label>
          </div>
        </section>

        <section className="am-panel">
          <div className="am-panel__header"><h2>Calculation Rules</h2></div>
          <div className="am-rule-list">
            <div><strong>Working Hours</strong><span>Check-out − Check-in − Break Time</span></div>
            <div><strong>Late</strong><span>Check-in compared with shift start + grace</span></div>
            <div><strong>Early Exit</strong><span>Check-out before configured threshold</span></div>
            <div><strong>Overtime</strong><span>Approved time after normal shift threshold</span></div>
          </div>
        </section>
      </div>
    </div>
  );
};
