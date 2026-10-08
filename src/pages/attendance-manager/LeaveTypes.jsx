import React, { useEffect, useMemo, useState } from 'react';
import { CalendarRange, Edit3, Plus, Save } from 'lucide-react';
import { ResponsiveModalSheet } from '../../components/common/ResponsiveModalSheet';
import { attendanceManagerService } from '../../services/attendanceManager.service';

const emptyForm = {
  name: '',
  code: '',
  type: 'Paid',
  allocationMethod: 'monthly',
  annualAllocation: 0,
  monthlyAllocation: 1,
  halfDay: true,
  maxCarryForward: 0,
  status: 'Active',
};

const normalizeForm = (row = {}) => ({
  name: row.name || '',
  code: row.code || '',
  type: 'Paid',
  allocationMethod: row.allocationMethod || 'annual',
  annualAllocation: Number(row.annualAllocation || 0),
  monthlyAllocation: Number(row.monthlyAllocation || 0),
  halfDay: row.halfDay !== false,
  maxCarryForward: Number(row.maxCarryForward || 0),
  status: row.status || 'Active',
});

export const LeaveTypes = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await attendanceManagerService.getLeaveTypes();
      setTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Unable to load leave types.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activeCount = useMemo(
    () => types.filter((item) => item.status === 'Active').length,
    [types],
  );

  const openCreate = () => {
    setEditor({ mode: 'create' });
    setForm(emptyForm);
    setError('');
  };

  const openEdit = (item) => {
    setEditor({ mode: 'edit', id: item.id });
    setForm(normalizeForm(item));
    setError('');
  };

  const closeEditor = () => {
    if (saving) return;
    setEditor(null);
    setError('');
  };

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const save = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.code.trim()) return;

    setSaving(true);
    setError('');

    const payload = {
      ...form,
      type: 'Paid',
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      annualAllocation: Number(form.annualAllocation || 0),
      monthlyAllocation: Number(form.monthlyAllocation || 0),
      maxCarryForward: Number(form.maxCarryForward || 0),
    };

    try {
      if (editor?.mode === 'edit') {
        await attendanceManagerService.updateLeaveType(editor.id, payload);
        setMessage('Leave type updated successfully.');
      } else {
        await attendanceManagerService.createLeaveType(payload);
        setMessage('Leave type added successfully.');
      }

      setEditor(null);
      await load();
      window.setTimeout(() => setMessage(''), 2500);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to save leave type.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="am-leave-types-page">
      <section className="am-leave-types-heading">
        <div>
          <h2>Company Leave Types</h2>
          <p>Configure paid leave allocation rules. Unpaid Leave is built in and always available to employees.</p>
        </div>

        <button type="button" className="am-primary-action" onClick={openCreate}>
          <Plus size={14} />
          Add Leave Type
        </button>
      </section>

      {message && <div className="am-inline-message is-success">{message}</div>}
      {error && !editor && <div className="am-inline-message is-error">{error}</div>}

      <section className="am-leave-types-summary">
        <article>
          <span>Configured</span>
          <strong>{types.length}</strong>
          <small>company leave policies</small>
        </article>
        <article>
          <span>Active</span>
          <strong>{activeCount}</strong>
          <small>shown to employees</small>
        </article>
        <article>
          <span>Monthly Policies</span>
          <strong>{types.filter((item) => item.allocationMethod === 'monthly').length}</strong>
          <small>reset each month</small>
        </article>
        <article>
          <span>Annual Policies</span>
          <strong>{types.filter((item) => item.allocationMethod === 'annual').length}</strong>
          <small>yearly allocation</small>
        </article>
      </section>

      {loading ? (
        <div className="am-leave-types-empty">Loading leave policies…</div>
      ) : (
        <section className="am-leave-type-grid">
          {types.map((item) => (
            <article key={item.id} className="am-leave-type-card">
              <header>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.code}</span>
                </div>
                <b className={item.status === 'Active' ? 'is-active' : 'is-inactive'}>
                  {item.status}
                </b>
              </header>

              <div className="am-leave-type-details">
                <div><span>Type</span><strong>{item.type}</strong></div>
                <div><span>Allocation</span><strong>{item.allocation}</strong></div>
                <div><span>Half Day</span><strong>{item.halfDay ? 'Allowed' : 'No'}</strong></div>
                <div><span>Carry Forward</span><strong>{item.carryForward}</strong></div>
              </div>

              <button type="button" onClick={() => openEdit(item)}>
                <Edit3 size={13} />
                Edit Config
              </button>
            </article>
          ))}

          {!types.length && (
            <div className="am-leave-types-empty">
              No paid leave policies configured. Employees can still apply for built-in Unpaid Leave.
            </div>
          )}
        </section>
      )}

      <ResponsiveModalSheet
        isOpen={Boolean(editor)}
        onClose={closeEditor}
        title={editor?.mode === 'edit' ? 'Edit Leave Type' : 'Add Leave Type'}
        maxWidth="620px"
      >
        <form className="am-leave-type-form" onSubmit={save}>
          {error && <div className="am-inline-message is-error">{error}</div>}

          <div className="am-leave-type-form-grid">
            <label>
              <span>Leave Name *</span>
              <input
                required
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                placeholder="e.g. Sick Leave"
              />
            </label>

            <label>
              <span>Leave Code *</span>
              <input
                required
                value={form.code}
                onChange={(event) => update('code', event.target.value)}
                placeholder="e.g. SL"
              />
            </label>

            <label>
              <span>Leave Type</span>
              <input value="Paid Leave" disabled />
              <small>Configured leave policies are always paid. Unpaid Leave is a separate built-in option.</small>
            </label>

            <label>
              <span>Allocation Period</span>
              <select
                value={form.allocationMethod}
                onChange={(event) => update('allocationMethod', event.target.value)}
              >
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
                <option value="manual">Manual</option>
              </select>
            </label>

            {form.allocationMethod === 'monthly' && (
              <label>
                <span>Days Per Month</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.monthlyAllocation}
                  onChange={(event) => update('monthlyAllocation', event.target.value)}
                />
              </label>
            )}

            {form.allocationMethod !== 'monthly' && (
              <label>
                <span>Days Per Year</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.annualAllocation}
                  onChange={(event) => update('annualAllocation', event.target.value)}
                />
              </label>
            )}

            <label>
              <span>Max Carry Forward</span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={form.maxCarryForward}
                onChange={(event) => update('maxCarryForward', event.target.value)}
              />
            </label>
          </div>

          <div className="am-leave-type-toggles">
            <label>
              <span>
                <strong>Half-Day Allowed</strong>
                <small>Employees can request a half day.</small>
              </span>
              <input
                type="checkbox"
                checked={form.halfDay}
                onChange={(event) => update('halfDay', event.target.checked)}
              />
            </label>

            <label>
              <span>
                <strong>Active</strong>
                <small>Only active policies with allocation appear for employees.</small>
              </span>
              <input
                type="checkbox"
                checked={form.status === 'Active'}
                onChange={(event) => update('status', event.target.checked ? 'Active' : 'Inactive')}
              />
            </label>
          </div>

          <div className="am-leave-type-form-actions">
            <button type="button" onClick={closeEditor}>Cancel</button>
            <button type="submit" className="is-primary" disabled={saving}>
              <Save size={13} />
              {saving ? 'Saving…' : 'Save Leave Type'}
            </button>
          </div>
        </form>
      </ResponsiveModalSheet>
    </div>
  );
};

export default LeaveTypes;
