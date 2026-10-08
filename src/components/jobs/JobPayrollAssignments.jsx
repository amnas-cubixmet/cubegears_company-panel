import React, { useEffect, useMemo, useState } from 'react';
import { Percent, Plus, Save, Trash2, UsersRound, Wrench } from 'lucide-react';
import { payrollService } from '../../services/payroll.service';

const emptyDraft = {
  id: '',
  employee: '',
  approvedWorkHours: '',
  eligibleLabourRevenue: '',
  eligibleServiceRevenue: '',
  commissionAllocationPercent: '',
  status: 'Approved',
};

const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const JobPayrollAssignments = ({
  jobId,
  staff,
  defaultLabourRevenue = 0,
}) => {
  const [rows, setRows] = useState([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    if (!jobId) return;
    setLoading(true);
    setError('');
    try {
      const data = await payrollService.getJobAssignments({ job: jobId });
      setRows(Array.isArray(data) ? data : data?.results || []);
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load payroll assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [jobId]);

  const allocationUsed = useMemo(
    () =>
      rows.reduce(
        (sum, row) => sum + Number(row.commissionAllocationPercent || 0),
        0,
      ),
    [rows],
  );

  const remainingAllocation = Math.max(0, 100 - allocationUsed);

  const reset = () => setDraft(emptyDraft);

  const edit = (row) => {
    setDraft({
      id: row.id,
      employee: row.employee || row.staffId || '',
      approvedWorkHours:
        row.approvedWorkHours ??
        (Number(row.approvedWorkMinutes || 0) / 60),
      eligibleLabourRevenue: row.eligibleLabourRevenue ?? '',
      eligibleServiceRevenue: row.eligibleServiceRevenue ?? '',
      commissionAllocationPercent: row.commissionAllocationPercent ?? '',
      status: row.status || 'Approved',
    });
  };

  const save = async (event) => {
    event.preventDefault();
    if (!draft.employee || saving) return;

    const selected = staff.find(
      (item) => String(item.id) === String(draft.employee),
    );

    setSaving(true);
    setError('');
    try {
      await payrollService.saveJobAssignment({
        ...(draft.id ? { id: draft.id } : {}),
        job: jobId,
        employee: draft.employee,
        staffId: draft.employee,
        staffName: selected?.name || '',
        role: selected?.designation || selected?.role || 'Mechanic',
        approvedWorkMinutes: Math.round(
          Number(draft.approvedWorkHours || 0) * 60,
        ),
        eligibleLabourRevenue: Number(
          draft.eligibleLabourRevenue || defaultLabourRevenue || 0,
        ),
        eligibleServiceRevenue: Number(
          draft.eligibleServiceRevenue || draft.eligibleLabourRevenue || defaultLabourRevenue || 0,
        ),
        commissionAllocationPercent: Number(
          draft.commissionAllocationPercent || 0,
        ),
        status: draft.status || 'Approved',
      });

      reset();
      await load();
    } catch (requestError) {
      const responseMessage =
        requestError?.response?.data?.commissionAllocationPercent?.[0] ||
        requestError?.response?.data?.commissionAllocationPercent ||
        requestError?.response?.data?.message;
      setError(
        responseMessage ||
          requestError?.message ||
          'Unable to save mechanic payroll assignment.',
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm('Remove this mechanic from payroll allocation for this Job Card?')) return;
    try {
      await payrollService.deleteJobAssignment(row.id);
      if (draft.id === row.id) reset();
      await load();
    } catch (requestError) {
      setError(requestError?.message || 'Unable to remove assignment.');
    }
  };

  return (
    <section className="job-payroll-assignments">
      <header className="job-payroll-assignments__head">
        <div>
          <UsersRound size={15} />
          <div>
            <strong>Mechanic Payroll Allocation</strong>
            <span>
              Approved hours, eligible labour revenue and commission split for this Job Card.
            </span>
          </div>
        </div>

        <div className="job-payroll-allocation-summary">
          <Percent size={12} />
          <span>Allocated</span>
          <strong>{allocationUsed}%</strong>
          <small>{remainingAllocation}% remaining</small>
        </div>
      </header>

      {loading ? (
        <div className="job-payroll-empty">Loading mechanic allocations…</div>
      ) : (
        <div className="job-payroll-assignment-list">
          {rows.map((row) => (
            <article key={row.id} className="job-payroll-assignment-card">
              <div>
                <strong>{row.staffName || row.employeeName || row.staffId}</strong>
                <span>{row.role || 'Mechanic'} · {row.status || 'Assigned'}</span>
              </div>

              <div className="job-payroll-assignment-metrics">
                <span>
                  <small>Approved Hours</small>
                  <b>{Number(row.approvedWorkHours || 0).toFixed(1)}h</b>
                </span>
                <span>
                  <small>Eligible Labour</small>
                  <b>{money(row.eligibleLabourRevenue)}</b>
                </span>
                <span>
                  <small>Commission Split</small>
                  <b>{Number(row.commissionAllocationPercent || 0)}%</b>
                </span>
              </div>

              <div className="job-payroll-assignment-actions">
                <button type="button" onClick={() => edit(row)}>
                  <Wrench size={12} />
                  Edit
                </button>
                <button type="button" className="is-danger" onClick={() => remove(row)}>
                  <Trash2 size={12} />
                  Remove
                </button>
              </div>
            </article>
          ))}

          {!rows.length && (
            <div className="job-payroll-empty">
              No payroll mechanics assigned yet. Add one below.
            </div>
          )}
        </div>
      )}

      <form className="job-payroll-assignment-form" onSubmit={save}>
        <div className="job-payroll-assignment-form__title">
          <div>
            <strong>{draft.id ? 'Edit Payroll Assignment' : 'Add Mechanic'}</strong>
            <span>Commission allocation across all mechanics cannot exceed 100%.</span>
          </div>
          {draft.id && (
            <button type="button" onClick={reset}>
              <Plus size={12} />
              New
            </button>
          )}
        </div>

        <div className="job-payroll-assignment-grid">
          <label>
            <span>Employee *</span>
            <select
              required
              value={draft.employee}
              onChange={(event) =>
                setDraft((old) => ({ ...old, employee: event.target.value }))
              }
              disabled={Boolean(draft.id)}
            >
              <option value="">Select mechanic</option>
              {staff.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {item.designation || item.role || 'Staff'}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Approved Work Hours</span>
            <input
              type="number"
              min="0"
              step="0.25"
              value={draft.approvedWorkHours}
              onChange={(event) =>
                setDraft((old) => ({
                  ...old,
                  approvedWorkHours: event.target.value,
                }))
              }
              placeholder="e.g. 4.5"
            />
          </label>

          <label>
            <span>Eligible Labour Revenue (₹)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={draft.eligibleLabourRevenue}
              onChange={(event) =>
                setDraft((old) => ({
                  ...old,
                  eligibleLabourRevenue: event.target.value,
                }))
              }
              placeholder={String(defaultLabourRevenue || 0)}
            />
          </label>

          <label>
            <span>Eligible Service Revenue (₹)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={draft.eligibleServiceRevenue}
              onChange={(event) =>
                setDraft((old) => ({
                  ...old,
                  eligibleServiceRevenue: event.target.value,
                }))
              }
              placeholder="Optional"
            />
          </label>

          <label>
            <span>Commission Allocation (%) *</span>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              required
              value={draft.commissionAllocationPercent}
              onChange={(event) =>
                setDraft((old) => ({
                  ...old,
                  commissionAllocationPercent: event.target.value,
                }))
              }
              placeholder={draft.id ? 'Existing split' : String(remainingAllocation)}
            />
          </label>

          <label>
            <span>Payroll Eligibility</span>
            <select
              value={draft.status}
              onChange={(event) =>
                setDraft((old) => ({ ...old, status: event.target.value }))
              }
            >
              <option value="Assigned">Assigned</option>
              <option value="Approved">Approved for Payroll</option>
              <option value="Completed">Completed</option>
            </select>
          </label>
        </div>

        {error && <div className="job-payroll-error">{error}</div>}

        <button type="submit" className="job-payroll-save" disabled={saving}>
          <Save size={13} />
          {saving
            ? 'Saving…'
            : draft.id
              ? 'Update Payroll Assignment'
              : 'Add Mechanic Allocation'}
        </button>
      </form>
    </section>
  );
};
