import React, { useEffect, useState } from 'react';
import { Plus, Trash2, UsersRound } from 'lucide-react';
import { payrollService } from '../../services/payroll.service';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';

export const JobWorkerAssignments = ({ jobId, staff = [], onChanged }) => {
  const { user } = useAuth();
  const canEdit = hasPermission(user, 'jobs.edit');
  const [rows, setRows] = useState([]);
  const [staffId, setStaffId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await payrollService.getJobTimerAssignments(jobId);
      setRows(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      setError(err?.message || 'Cannot load assigned mechanics.');
    }
  };

  useEffect(() => { if (jobId) load(); }, [jobId]);

  const add = async (event) => {
    event.preventDefault();
    if (!staffId || saving) return;
    setSaving(true);
    setError('');
    try {
      await payrollService.createJobTimerAssignment(jobId, staffId);
      setStaffId('');
      await load();
      onChanged?.();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Cannot assign mechanic.');
    } finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('Unassign this worker from the Job Card?')) return;
    setSaving(true);
    setError('');
    try {
      await payrollService.deleteJobTimerAssignment(id);
      await load();
      onChanged?.();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Cannot unassign mechanic.');
    } finally { setSaving(false); }
  };

  return (
    <section className="job-payroll-assignments">
      <header className="job-payroll-assignments__head">
        <div>
          <UsersRound size={18} />
          <div>
            <strong>Assigned Mechanics & Workers</strong>
            <span>Assign mechanics, painters, electricians or freelancers. Set customer and worker charges separately for each service below.</span>
          </div>
        </div>
        <strong>{rows.length} assigned</strong>
      </header>

      <div className="job-worker-assignment-list">
        {rows.map((row) => (
          <div key={row.id} className="job-worker-assignment-item">
            <div><strong>{row.staffName}</strong><span>{row.role || 'Workshop staff'}</span></div>
            {canEdit && (
              <button type="button" onClick={() => remove(row.id)} disabled={saving}
                aria-label={`Unassign ${row.staffName}`}><Trash2 size={15}/> Remove</button>
            )}
          </div>
        ))}
        {!rows.length && <div className="job-payroll-empty">No mechanic assigned. Add a worker to begin tracking service work.</div>}
      </div>

      {canEdit && (
        <form className="job-worker-assignment-add" onSubmit={add}>
          <label>
            Add worker
            <select required value={staffId} onChange={(event) => setStaffId(event.target.value)}>
              <option value="">Select mechanic / painter / electrician</option>
              {staff.filter((person) => !rows.some((row) => String(row.staffId) === String(person.id))).map((person) => (
                <option key={person.id} value={person.id}>{person.name} · {person.designation || 'Worker'}</option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={saving || !staffId}><Plus size={15}/>{saving ? 'Adding…' : 'Assign Worker'}</button>
        </form>
      )}
      {error && <p className="job-payroll-error" role="alert">{error}</p>}
    </section>
  );
};
