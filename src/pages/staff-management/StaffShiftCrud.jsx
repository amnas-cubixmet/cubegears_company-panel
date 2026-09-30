import React, { useEffect, useMemo, useState } from 'react';
import { Clock3, Pencil, Plus, Save, Trash2, Users } from 'lucide-react';
import { ResponsiveModalSheet } from '../../components/common/ResponsiveModalSheet';
import { staffManagementService } from '../../services/staffManagement.service';

const EMPTY_FORM = {
  name: '',
  startTime: '09:00 AM',
  endTime: '06:00 PM',
  weeklyOff: 'Sunday',
  branch: 'All Branches',
  assignedStaffIds: []
};

const splitShiftTime = (value = '') => {
  const [startTime = '09:00 AM', endTime = '06:00 PM'] = value.split(' - ');
  return { startTime, endTime };
};

export const StaffShiftCrud = ({ staff = [] }) => {
  const [shifts, setShifts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const activeStaff = useMemo(
    () => staff.filter((item) => ['Active', 'Probation', 'Notice Period'].includes(item.employmentStatus)),
    [staff]
  );

  const load = async () => {
    const data = await staffManagementService.getShifts();
    setShifts(data);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setOpen(true);
  };

  const openEdit = (shift) => {
    const { startTime, endTime } = splitShiftTime(shift.time);
    setEditing(shift);
    setForm({
      name: shift.name,
      startTime,
      endTime,
      weeklyOff: shift.weeklyOff || 'Sunday',
      branch: shift.branch || 'All Branches',
      assignedStaffIds: shift.assignedStaffIds || []
    });
    setError('');
    setOpen(true);
  };

  const toggleStaff = (id) => {
    setForm((current) => ({
      ...current,
      assignedStaffIds: current.assignedStaffIds.includes(id)
        ? current.assignedStaffIds.filter((staffId) => staffId !== id)
        : [...current.assignedStaffIds, id]
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || saving) return;

    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        time: `${form.startTime.trim()} - ${form.endTime.trim()}`,
        weeklyOff: form.weeklyOff,
        branch: form.branch,
        assignedStaffIds: form.assignedStaffIds
      };

      if (editing) await staffManagementService.updateShift(editing.id, payload);
      else await staffManagementService.createShift(payload);

      await load();
      setOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err?.message || 'Unable to save shift.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (shift) => {
    if (!window.confirm(`Delete "${shift.name}"? Assigned staff will move to General Shift.`)) return;
    try {
      await staffManagementService.deleteShift(shift.id);
      await load();
    } catch (err) {
      window.alert(err?.message || 'Unable to delete shift.');
    }
  };

  return (
    <div className="staff-crud-view">
      <section className="staff-workshop-section-header">
        <div>
          <h2>Shift Assignment</h2>
          <p>Create, edit, delete and assign workshop shifts by branch and weekly off.</p>
        </div>
        <button type="button" className="staff-crud-add-button" onClick={openCreate}>
          <Plus size={15}/> Add Shift
        </button>
      </section>

      <div className="staff-crud-summary-grid">
        <div><Clock3 size={16}/><span>Total Shifts</span><strong>{shifts.length}</strong></div>
        <div><Users size={16}/><span>Assigned Staff</span><strong>{new Set(shifts.flatMap((shift) => shift.assignedStaffIds || [])).size}</strong></div>
        <div><Users size={16}/><span>Unassigned</span><strong>{Math.max(activeStaff.length - new Set(shifts.flatMap((shift) => shift.assignedStaffIds || [])).size, 0)}</strong></div>
      </div>

      <div className="staff-crud-card-grid">
        {shifts.map((shift) => {
          const members = activeStaff.filter((person) => shift.assignedStaffIds?.includes(person.id));
          return (
            <article key={shift.id} className="staff-crud-card">
              <div className="staff-crud-card__head">
                <div className="staff-crud-card__icon"><Clock3 size={17}/></div>
                <div>
                  <h3>{shift.name}</h3>
                  <p>{shift.time}</p>
                </div>
                {shift.id === 'SHIFT-GENERAL' ? <span className="staff-crud-protected">Default</span> : null}
              </div>

              <div className="staff-crud-detail-grid">
                <div><span>Weekly Off</span><strong>{shift.weeklyOff}</strong></div>
                <div><span>Branch</span><strong>{shift.branch}</strong></div>
                <div><span>Assigned Staff</span><strong>{members.length}</strong></div>
              </div>

              <div className="staff-crud-assignees">
                {members.length
                  ? members.map((person) => <span key={person.id}>{person.name}</span>)
                  : <span className="is-muted">No staff assigned</span>}
              </div>

              <div className="staff-crud-actions">
                <button type="button" onClick={() => openEdit(shift)}><Pencil size={13}/> Edit</button>
                <button
                  type="button"
                  className="is-danger"
                  disabled={shift.id === 'SHIFT-GENERAL'}
                  onClick={() => remove(shift)}
                >
                  <Trash2 size={13}/> Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <ResponsiveModalSheet
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Workshop Shift' : 'Add Workshop Shift'}
        maxWidth="620px"
      >
        <form className="staff-crud-form" onSubmit={submit}>
          {error ? <div className="staff-crud-error">{error}</div> : null}

          <label>
            Shift Name *
            <input required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="e.g. Night Shift"/>
          </label>

          <div className="staff-crud-form__grid">
            <label>Start Time<input value={form.startTime} onChange={(e)=>setForm({...form,startTime:e.target.value})} placeholder="09:00 AM"/></label>
            <label>End Time<input value={form.endTime} onChange={(e)=>setForm({...form,endTime:e.target.value})} placeholder="06:00 PM"/></label>
            <label>
              Weekly Off
              <select value={form.weeklyOff} onChange={(e)=>setForm({...form,weeklyOff:e.target.value})}>
                {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((day)=><option key={day}>{day}</option>)}
              </select>
            </label>
            <label>
              Branch
              <select value={form.branch} onChange={(e)=>setForm({...form,branch:e.target.value})}>
                <option>All Branches</option>
                <option>Main Garage Branch</option>
                <option>Kochi South Branch</option>
              </select>
            </label>
          </div>

          <fieldset className="staff-crud-assignment-fieldset">
            <legend>Assign Staff</legend>
            <div className="staff-crud-check-grid">
              {activeStaff.map((person) => (
                <label key={person.id} className="staff-crud-check">
                  <input
                    type="checkbox"
                    checked={form.assignedStaffIds.includes(person.id)}
                    onChange={() => toggleStaff(person.id)}
                  />
                  <span><strong>{person.name}</strong><small>{person.designation} · {person.branch}</small></span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="staff-crud-form__actions">
            <button type="button" className="staff-crud-cancel-button" onClick={()=>setOpen(false)}>Cancel</button>
            <button type="submit" className="staff-crud-save-button" disabled={saving}>
              <Save size={14}/>{saving ? 'Saving...' : editing ? 'Update Shift' : 'Create Shift'}
            </button>
          </div>
        </form>
      </ResponsiveModalSheet>
    </div>
  );
};
