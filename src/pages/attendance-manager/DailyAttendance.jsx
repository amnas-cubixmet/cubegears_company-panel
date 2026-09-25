import React, { useEffect, useMemo, useState } from 'react';
import { Edit3, Search } from 'lucide-react';
import { attendanceManagerService } from '../../services/attendanceManager.service';
import { ResponsiveModalSheet } from '../../components/common/ResponsiveModalSheet';

const STATUSES = ['Present', 'Absent', 'Half Day', 'On Leave', 'Weekly Off'];

const timeToMinutes = (value) => {
  if (!value || value === 'Working') return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return hour * 60 + minute;
};

const formatMinutes = (minutes) => {
  if (!Number.isFinite(minutes) || minutes < 0) return '0h';
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

export const DailyAttendance = () => {
  const [team, setTeam] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ status: 'Present', clockIn: '', clockOut: '', notes: '', reason: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const data = await attendanceManagerService.getTeamAttendance();
    setTeam(data);
  };

  useEffect(() => { load(); }, []);

  const branches = useMemo(() => ['All', ...new Set(team.map((item) => item.branch))], [team]);

  const filtered = team.filter((item) => {
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesBranch = branchFilter === 'All' || item.branch === branchFilter;
    const text = `${item.name} ${item.staffId} ${item.designation}`.toLowerCase();
    return matchesStatus && matchesBranch && text.includes(query.toLowerCase());
  });

  const quickMark = async (item, status) => {
    await attendanceManagerService.updateTeamAttendance(item.id, { status }, `Quick marked as ${status}`);
    load();
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      status: item.status || 'Present',
      clockIn: item.clockIn || '',
      clockOut: item.clockOut || '',
      notes: item.notes || '',
      reason: ''
    });
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    if (!form.reason.trim()) return;

    setSaving(true);
    try {
      const start = timeToMinutes(form.clockIn);
      const end = timeToMinutes(form.clockOut);
      const worked = start !== null && end !== null && end >= start ? end - start : null;

      await attendanceManagerService.updateTeamAttendance(editItem.id, {
        status: form.status,
        clockIn: form.clockIn || null,
        clockOut: form.clockOut || null,
        worked: worked !== null ? formatMinutes(worked) : editItem.worked,
        workingMinutes: worked ?? editItem.workingMinutes,
        notes: form.notes
      }, form.reason);

      setEditItem(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="attendance-manager-module attendance-manager-daily flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-2 rounded-2xl border border-line bg-surface p-3 md:grid-cols-[minmax(220px,1fr)_180px_180px]">
        <label className="flex h-10 items-center gap-2 rounded-xl border border-line bg-surface-2 px-3">
          <Search size={15} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employee..."
            className="min-w-0 flex-1 border-0 bg-transparent text-xs text-content outline-none"
          />
        </label>
        <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="h-10 rounded-xl border border-line bg-surface-2 px-3 text-xs text-content">
          {branches.map((branch) => <option key={branch}>{branch}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-xl border border-line bg-surface-2 px-3 text-xs text-content">
          <option>All</option>
          {[...STATUSES, 'Missing Clock Out'].map((status) => <option key={status}>{status}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[1050px] border-collapse text-left">
          <thead className="bg-surface-2">
            <tr className="text-[10px] uppercase tracking-wide text-muted">
              {['Employee','Role / Branch','Check In','Check Out','Working','OT','Status','Notes','Actions'].map((head) => (
                <th key={head} className="px-3 py-3 font-bold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-t border-line text-xs">
                <td className="px-3 py-3">
                  <div className="font-bold text-content">{item.name}</div>
                  <div className="text-[10px] text-muted">{item.staffId}</div>
                </td>
                <td className="px-3 py-3 text-secondary">{item.designation}<br/><span className="text-[10px] text-muted">{item.branch}</span></td>
                <td className="px-3 py-3 text-content">{item.clockIn || '—'}</td>
                <td className="px-3 py-3 text-content">{item.clockOut || '—'}</td>
                <td className="px-3 py-3 font-semibold text-content">{item.worked || '—'}</td>
                <td className="px-3 py-3 text-content">{item.overtimeHours || 0}h</td>
                <td className="px-3 py-3">
                  <select
                    value={STATUSES.includes(item.status) ? item.status : item.status}
                    onChange={(e) => quickMark(item, e.target.value)}
                    className="h-8 rounded-lg border border-line bg-surface-2 px-2 text-[11px] font-semibold text-content"
                  >
                    {!STATUSES.includes(item.status) ? <option>{item.status}</option> : null}
                    {STATUSES.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </td>
                <td className="max-w-[180px] truncate px-3 py-3 text-muted">{item.notes || '—'}</td>
                <td className="px-3 py-3">
                  <button onClick={() => openEdit(item)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-[11px] font-semibold text-content">
                    <Edit3 size={13}/>Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ResponsiveModalSheet isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Attendance" maxWidth="520px">
        {editItem && (
          <form onSubmit={saveEdit} className="flex flex-col gap-3">
            <div className="rounded-xl bg-surface-2 p-3 text-xs text-secondary">
              <strong className="text-content">{editItem.name}</strong> · {editItem.staffId}<br/>
              Shift: {editItem.shift}
            </div>

            <label className="text-xs font-semibold text-secondary">Status
              <select value={form.status} onChange={(e) => setForm({...form,status:e.target.value})} className="mt-1 h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm text-content">
                {STATUSES.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-secondary">Check In
                <input value={form.clockIn} onChange={(e) => setForm({...form,clockIn:e.target.value})} placeholder="09:00 AM" className="mt-1 h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm text-content"/>
              </label>
              <label className="text-xs font-semibold text-secondary">Check Out
                <input value={form.clockOut} onChange={(e) => setForm({...form,clockOut:e.target.value})} placeholder="06:00 PM" className="mt-1 h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm text-content"/>
              </label>
            </div>

            <label className="text-xs font-semibold text-secondary">Notes
              <input value={form.notes} onChange={(e) => setForm({...form,notes:e.target.value})} className="mt-1 h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm text-content"/>
            </label>

            <label className="text-xs font-semibold text-secondary">Edit Reason *
              <textarea required rows={3} value={form.reason} onChange={(e) => setForm({...form,reason:e.target.value})} placeholder="Why is this attendance being corrected?" className="mt-1 min-h-24 w-full rounded-xl border border-line bg-surface-2 p-3 text-sm text-content"/>
            </label>

            <button disabled={saving} className="h-11 rounded-xl border-0 bg-primary text-sm font-bold text-white">
              {saving ? 'Saving...' : 'Save Attendance Correction'}
            </button>
          </form>
        )}
      </ResponsiveModalSheet>
    </div>
  );
};
