import React, { useEffect, useState } from 'react';
import { Clock3, Save } from 'lucide-react';
import { attendanceManagerService } from '../../services/attendanceManager.service';

export const ShiftSettings = () => {
  const [rules, setRules] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    attendanceManagerService.getRules().then((data) => setRules(data));
  }, []);

  if (!rules) return <div className="p-4 text-sm text-muted">Loading shifts...</div>;

  const set = (key, value) => setRules((old) => ({ ...old, [key]: value }));

  const save = async () => {
    setSaving(true);
    try { await attendanceManagerService.saveRules(rules); }
    finally { setSaving(false); }
  };

  const input = 'mt-1 h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm text-content outline-none focus:border-primary';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-line bg-surface p-4">
        <div>
          <div className="flex items-center gap-2 text-base font-extrabold text-content"><Clock3 size={17} className="text-primary"/>Shift Settings</div>
          <div className="mt-1 text-xs text-muted">Shift time drives late, early exit, working hours and overtime calculations.</div>
        </div>
        <button onClick={save} className="inline-flex h-10 items-center gap-2 rounded-xl border-0 bg-primary px-4 text-xs font-bold text-white">
          <Save size={15}/>{saving ? 'Saving...' : 'Save Shift'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="text-sm font-extrabold text-content">General Workshop Shift</div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-secondary">Start Time
              <input value={rules.startTime || ''} onChange={(e)=>set('startTime',e.target.value)} className={input}/>
            </label>
            <label className="text-xs font-semibold text-secondary">End Time
              <input value={rules.endTime || ''} onChange={(e)=>set('endTime',e.target.value)} className={input}/>
            </label>
            <label className="text-xs font-semibold text-secondary">Break Minutes
              <input type="number" min="0" value={rules.breakMinutes ?? 60} onChange={(e)=>set('breakMinutes',Number(e.target.value))} className={input}/>
            </label>
            <label className="text-xs font-semibold text-secondary">Late Grace
              <input type="number" min="0" value={rules.lateGraceMinutes ?? 15} onChange={(e)=>set('lateGraceMinutes',Number(e.target.value))} className={input}/>
            </label>
            <label className="text-xs font-semibold text-secondary">Early Exit Threshold
              <input type="number" min="0" value={rules.earlyExitThreshold ?? 15} onChange={(e)=>set('earlyExitThreshold',Number(e.target.value))} className={input}/>
            </label>
            <label className="text-xs font-semibold text-secondary">OT Starts After (min)
              <input type="number" min="0" value={rules.overtimeThreshold ?? 60} onChange={(e)=>set('overtimeThreshold',Number(e.target.value))} className={input}/>
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="text-sm font-extrabold text-content">Calculation Rules</div>
          <div className="mt-3 flex flex-col gap-2 text-xs text-secondary">
            <div className="rounded-xl bg-surface-2 p-3"><strong className="text-content">Working Hours:</strong> Check-out − Check-in − Break Time</div>
            <div className="rounded-xl bg-surface-2 p-3"><strong className="text-content">Late:</strong> Check-in compared with shift start + grace</div>
            <div className="rounded-xl bg-surface-2 p-3"><strong className="text-content">Early Exit:</strong> Check-out before configured threshold</div>
            <div className="rounded-xl bg-surface-2 p-3"><strong className="text-content">Overtime:</strong> Approved time after normal shift threshold</div>
          </div>
        </div>
      </div>
    </div>
  );
};
