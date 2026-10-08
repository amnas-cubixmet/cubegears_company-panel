import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { ResponsiveModalSheet } from '../common/ResponsiveModalSheet';

export const StaffProfileEditSheet = ({
  open,
  onClose,
  staff,
  roles,
  teams,
  shifts,
  skills,
  onSave,
}) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [skillIds, setSkillIds] = useState([]);

  useEffect(() => {
    if (!open || !staff) return;
    setForm({
      name: staff.name || '',
      phone: staff.phone || '',
      email: staff.email || '',
      designation: staff.designation || '',
      role: staff.role || '',
      teamId: staff.teamId || '',
      shiftId: staff.shiftId || '',
      employmentStatus: staff.employmentStatus || 'Active',
      emergencyContact: staff.emergencyContact || '',
      address: staff.address || '',
      notes: staff.notes || '',
    });

    const currentNames = new Set(staff.skills || []);
    setSkillIds(
      skills
        .filter((skill) => currentNames.has(skill.name))
        .map((skill) => String(skill.id)),
    );
  }, [open, staff, skills]);

  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const toggleSkill = (skill) => {
    const id = String(skill.id);
    setSkillIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await onSave({
        ...form,
        teamId: form.teamId || null,
        shiftId: form.shiftId || null,
        skillIds: skills
          .filter((skill) => skillIds.includes(String(skill.id)))
          .map((skill) => skill.id),
        skills: skills
          .filter((skill) => skillIds.includes(String(skill.id)))
          .map((skill) => skill.name),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveModalSheet
      isOpen={open}
      onClose={onClose}
      title="Edit Staff Profile"
      maxWidth="680px"
    >
      <form className="staff-profile-edit-form" onSubmit={submit}>
        <div className="staff-profile-edit-grid">
          <label>Full Name<input required value={form.name || ''} onChange={(e) => set('name', e.target.value)} /></label>
          <label>Phone<input value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} /></label>
          <label>Email<input type="email" value={form.email || ''} onChange={(e) => set('email', e.target.value)} /></label>
          <label>Designation<input value={form.designation || ''} onChange={(e) => set('designation', e.target.value)} /></label>

          <label>
            Role
            <select value={form.role || ''} onChange={(e) => set('role', e.target.value)}>
              {roles.map((role) => <option key={role.id} value={role.name}>{role.name}</option>)}
            </select>
          </label>

          <label>
            Team
            <select value={form.teamId || ''} onChange={(e) => set('teamId', e.target.value)}>
              <option value="">Unassigned</option>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
          </label>

          <label>
            Shift
            <select value={form.shiftId || ''} onChange={(e) => set('shiftId', e.target.value)}>
              <option value="">Unassigned</option>
              {shifts.map((shift) => <option key={shift.id} value={shift.id}>{shift.name}</option>)}
            </select>
          </label>

          <label>
            Status
            <select value={form.employmentStatus || 'Active'} onChange={(e) => set('employmentStatus', e.target.value)}>
              {['Active','Probation','Notice Period','Suspended','Resigned','Terminated','Inactive'].map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>

          <label>Emergency Contact<input value={form.emergencyContact || ''} onChange={(e) => set('emergencyContact', e.target.value)} /></label>

          <label className="is-wide">Address<textarea rows={3} value={form.address || ''} onChange={(e) => set('address', e.target.value)} /></label>
          <label className="is-wide">Notes<textarea rows={3} value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} /></label>
        </div>

        <p className="staff-profile-edit-pay-note">
          Pay type and rates are managed in the staff profile's Payroll tab.
          Use Change Pay Configuration there to preserve effective-dated payroll history.
        </p>

        <div className="staff-profile-edit-skills">
          <span>Skills</span>
          <div>
            {skills.map((skill) => (
              <button
                key={skill.id}
                type="button"
                className={skillIds.includes(String(skill.id)) ? 'is-selected' : ''}
                onClick={() => toggleSkill(skill)}
              >
                {skill.name}
              </button>
            ))}
          </div>
        </div>

        <div className="staff-profile-edit-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" className="is-primary" disabled={saving}>
            <Save size={13} />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </ResponsiveModalSheet>
  );
};
