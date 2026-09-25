import React, { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Save, Trash2, Users, Wrench } from 'lucide-react';
import { ResponsiveModalSheet } from '../../components/common/ResponsiveModalSheet';
import { staffManagementService } from '../../services/staffManagement.service';

const EMPTY_FORM = {
  name: '',
  category: 'Mechanical',
  description: '',
  assignedStaffIds: []
};

export const StaffSkillCrud = ({ staff = [] }) => {
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const activeStaff = useMemo(
    () => staff.filter((item) => ['Active', 'Probation', 'Notice Period'].includes(item.employmentStatus)),
    [staff]
  );

  const load = async () => setSkills(await staffManagementService.getSkills());

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setOpen(true);
  };

  const openEdit = (skill) => {
    setEditing(skill);
    setForm({
      name: skill.name,
      category: skill.category || 'Workshop',
      description: skill.description || '',
      assignedStaffIds: skill.assignedStaffIds || []
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
      if (editing) await staffManagementService.updateSkill(editing.id, form);
      else await staffManagementService.createSkill(form);

      await load();
      setOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err?.message || 'Unable to save skill.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (skill) => {
    if (!window.confirm(`Delete skill "${skill.name}"? It will be removed from assigned staff.`)) return;
    try {
      await staffManagementService.deleteSkill(skill.id);
      await load();
    } catch (err) {
      window.alert(err?.message || 'Unable to delete skill.');
    }
  };

  const categoryCount = new Set(skills.map((skill) => skill.category)).size;

  return (
    <div className="staff-crud-view">
      <section className="staff-workshop-section-header">
        <div>
          <h2>Skills & Specialization</h2>
          <p>Create, edit, delete and assign workshop skills to technicians and support staff.</p>
        </div>
        <button type="button" className="staff-crud-add-button" onClick={openCreate}>
          <Plus size={15}/> Add Skill
        </button>
      </section>

      <div className="staff-crud-summary-grid">
        <div><Wrench size={16}/><span>Total Skills</span><strong>{skills.length}</strong></div>
        <div><Users size={16}/><span>Skill Categories</span><strong>{categoryCount}</strong></div>
        <div><Users size={16}/><span>Staff With Skills</span><strong>{activeStaff.filter((person)=>person.skills?.length).length}</strong></div>
      </div>

      <div className="staff-crud-card-grid">
        {skills.map((skill) => {
          const members = activeStaff.filter((person) => skill.assignedStaffIds?.includes(person.id));
          return (
            <article key={skill.id} className="staff-crud-card">
              <div className="staff-crud-card__head">
                <div className="staff-crud-card__icon"><Wrench size={17}/></div>
                <div>
                  <h3>{skill.name}</h3>
                  <p>{skill.category}</p>
                </div>
                <span className="staff-crud-count">{members.length}</span>
              </div>

              <p className="staff-crud-description">{skill.description || 'Workshop specialization skill.'}</p>

              <div className="staff-crud-assignees">
                {members.length
                  ? members.slice(0, 5).map((person) => <span key={person.id}>{person.name}</span>)
                  : <span className="is-muted">No staff assigned</span>}
                {members.length > 5 ? <span>+{members.length - 5}</span> : null}
              </div>

              <div className="staff-crud-actions">
                <button type="button" onClick={() => openEdit(skill)}><Pencil size={13}/> Edit</button>
                <button type="button" className="is-danger" onClick={() => remove(skill)}><Trash2 size={13}/> Delete</button>
              </div>
            </article>
          );
        })}
      </div>

      <ResponsiveModalSheet
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Skill' : 'Add Workshop Skill'}
        maxWidth="620px"
      >
        <form className="staff-crud-form" onSubmit={submit}>
          {error ? <div className="staff-crud-error">{error}</div> : null}

          <div className="staff-crud-form__grid">
            <label>
              Skill Name *
              <input required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="e.g. Diesel Injection"/>
            </label>
            <label>
              Category
              <select value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}>
                {['Mechanical','Electrical','Diagnostics','Body Shop','Tyres & Alignment','Service Desk','Workshop'].map((category)=><option key={category}>{category}</option>)}
              </select>
            </label>
          </div>

          <label>
            Description
            <textarea rows={3} value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} placeholder="What this skill covers"/>
          </label>

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
                  <span><strong>{person.name}</strong><small>{person.designation} · {person.department}</small></span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="staff-crud-form__actions">
            <button type="button" className="staff-crud-cancel-button" onClick={()=>setOpen(false)}>Cancel</button>
            <button type="submit" className="staff-crud-save-button" disabled={saving}>
              <Save size={14}/>{saving ? 'Saving...' : editing ? 'Update Skill' : 'Create Skill'}
            </button>
          </div>
        </form>
      </ResponsiveModalSheet>
    </div>
  );
};
