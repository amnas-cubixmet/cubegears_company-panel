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
    <div className="attendance-manager-module attendance-manager-daily">
      <section className="am-filter-card">
        <label className="am-search-field">
          <Search size={15} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search employee..." />
        </label>
        <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
          {branches.map((branch) => <option key={branch}>{branch}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All</option>
          {[...STATUSES, 'Missing Clock Out'].map((status) => <option key={status}>{status}</option>)}
        </select>
      </section>

      <div className="am-daily-mobile-list">
        {filtered.map((item) => (
          <article key={item.id} className="am-staff-card">
            <div className="am-staff-card__head">
              <div>
                <strong>{item.name}</strong>
                <span>{item.staffId} · {item.designation}</span>
              </div>
              <select value={item.status} onChange={(e) => quickMark(item, e.target.value)}>
                {!STATUSES.includes(item.status) ? <option>{item.status}</option> : null}
                {STATUSES.map((status) => <option key={status}>{status}</option>)}
              </select>
            </div>
            <div className="am-staff-card__grid">
              <div><span>Branch</span><strong>{item.branch}</strong></div>
              <div><span>Check In</span><strong>{item.clockIn || '—'}</strong></div>
              <div><span>Check Out</span><strong>{item.clockOut || '—'}</strong></div>
              <div><span>Working</span><strong>{item.worked || '—'}</strong></div>
              <div><span>OT</span><strong>{item.overtimeHours || 0}h</strong></div>
              <div><span>Notes</span><strong>{item.notes || '—'}</strong></div>
            </div>
            <button type="button" className="am-edit-button" onClick={() => openEdit(item)}>
              <Edit3 size={14}/> Edit Attendance
            </button>
          </article>
        ))}
      </div>

      <div className="am-table-card am-daily-table">
        <table>
          <thead>
            <tr>
              {['Employee','Role / Branch','Check In','Check Out','Working','OT','Status','Notes','Actions'].map((head) => (
                <th key={head}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.name}</strong><span className="am-table-subtext">{item.staffId}</span></td>
                <td>{item.designation}<span className="am-table-subtext">{item.branch}</span></td>
                <td>{item.clockIn || '—'}</td>
                <td>{item.clockOut || '—'}</td>
                <td><strong>{item.worked || '—'}</strong></td>
                <td>{item.overtimeHours || 0}h</td>
                <td>
                  <select value={item.status} onChange={(e) => quickMark(item, e.target.value)}>
                    {!STATUSES.includes(item.status) ? <option>{item.status}</option> : null}
                    {STATUSES.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </td>
                <td className="am-notes-cell">{item.notes || '—'}</td>
                <td>
                  <button type="button" className="am-edit-button am-edit-button--compact" onClick={() => openEdit(item)}>
                    <Edit3 size={13}/> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ResponsiveModalSheet isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Attendance" maxWidth="520px">
        {editItem && (
          <form onSubmit={saveEdit} className="am-edit-form">
            <div className="am-edit-summary">
              <strong>{editItem.name}</strong> · {editItem.staffId}<br/>
              Shift: {editItem.shift}
            </div>

            <label>Status
              <select value={form.status} onChange={(e) => setForm({...form,status:e.target.value})}>
                {STATUSES.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>

            <div className="am-form-grid">
              <label>Check In
                <input value={form.clockIn} onChange={(e) => setForm({...form,clockIn:e.target.value})} placeholder="09:00 AM"/>
              </label>
              <label>Check Out
                <input value={form.clockOut} onChange={(e) => setForm({...form,clockOut:e.target.value})} placeholder="06:00 PM"/>
              </label>
            </div>

            <label>Notes
              <input value={form.notes} onChange={(e) => setForm({...form,notes:e.target.value})}/>
            </label>

            <label>Edit Reason *
              <textarea required rows={3} value={form.reason} onChange={(e) => setForm({...form,reason:e.target.value})} placeholder="Why is this attendance being corrected?"/>
            </label>

            <button disabled={saving} className="am-save-button">
              {saving ? 'Saving...' : 'Save Attendance Correction'}
            </button>
          </form>
        )}
      </ResponsiveModalSheet>
    </div>
  );
};
