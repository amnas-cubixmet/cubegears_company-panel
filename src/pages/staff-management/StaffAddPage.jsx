import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus, Wrench } from 'lucide-react';
import { staffService } from '../../services/staff.service';
import { workshopDepartments, workshopSkills, workshopShifts } from '../../mock/staffManagement.mock';

const roleOptions = [
  'Mechanic',
  'Senior Mechanic',
  'Electrician',
  'Service Advisor',
  'Helper',
  'Supervisor',
  'Accountant',
  'Branch Manager',
  'Admin'
];

const statusOptions = ['Active', 'Probation', 'Notice Period', 'Suspended', 'Resigned', 'Terminated'];

export const StaffAddPage = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState(['Diagnostics']);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    designation: 'Mechanic',
    role: 'Mechanic',
    department: 'Mechanical',
    branch: 'Main Garage Branch',
    joiningDate: new Date().toISOString().split('T')[0],
    employmentStatus: 'Active',
    shift: 'General Shift (09:00 AM - 06:00 PM)',
    weeklyOff: 'Sunday',
    emergencyContact: '',
    address: '',
    idProof: 'Not uploaded',
    paymentType: 'Monthly Salary',
    notes: ''
  });

  const selectedShift = useMemo(
    () => workshopShifts.find((item) => form.shift.startsWith(item.name)),
    [form.shift]
  );

  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }));

  const toggleSkill = (skill) => {
    setSelectedSkills((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill]
    );
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;

    setSaving(true);
    try {
      await staffService.createStaff({
        ...form,
        skills: selectedSkills,
        company: 'CubeGears Garage Services',
        reportingManager: 'Workshop Manager',
        permittedBranches: [form.branch],
        photo: '',
        salary: { basic: 0, allowances: 0, incentives: 0, grossSalary: 0, advanceBalance: 0 }
      });
      navigate('/staff-management/staff');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="staff-add-page" onSubmit={submit}>
      <section className="staff-add-page__header">
        <div>
          <button type="button" onClick={() => navigate('/staff-management/staff')} className="staff-back-button">
            <ArrowLeft size={15}/> All Staff
          </button>
          <h2>Add Staff</h2>
          <p>Create workshop staff profile, role, team, shift, skills and employment details.</p>
        </div>
        <button className="staff-save-button" type="submit" disabled={saving}>
          <Save size={15}/>{saving ? 'Saving...' : 'Save Staff'}
        </button>
      </section>

      <div className="staff-add-layout">
        <div className="staff-add-main">
          <section className="staff-form-panel">
            <div className="staff-form-panel__title"><UserPlus size={16}/> Personal & Employment</div>
            <div className="staff-form-grid">
              <label>Full Name *<input required value={form.name} onChange={(e)=>set('name',e.target.value)} placeholder="Staff full name"/></label>
              <label>Phone *<input required value={form.phone} onChange={(e)=>set('phone',e.target.value)} placeholder="+91 ..."/></label>
              <label>Email<input type="email" value={form.email} onChange={(e)=>set('email',e.target.value)} placeholder="name@cubegears.com"/></label>
              <label>Designation<input value={form.designation} onChange={(e)=>set('designation',e.target.value)} /></label>
              <label>System Role
                <select value={form.role} onChange={(e)=>set('role',e.target.value)}>
                  {roleOptions.map((role)=><option key={role}>{role}</option>)}
                </select>
              </label>
              <label>Status
                <select value={form.employmentStatus} onChange={(e)=>set('employmentStatus',e.target.value)}>
                  {statusOptions.map((status)=><option key={status}>{status}</option>)}
                </select>
              </label>
              <label>Joining Date<input type="date" value={form.joiningDate} onChange={(e)=>set('joiningDate',e.target.value)}/></label>
              <label>Branch
                <select value={form.branch} onChange={(e)=>set('branch',e.target.value)}>
                  <option>Main Garage Branch</option>
                  <option>Kochi South Branch</option>
                </select>
              </label>
            </div>
          </section>

          <section className="staff-form-panel">
            <div className="staff-form-panel__title"><Wrench size={16}/> Workshop Assignment</div>
            <div className="staff-form-grid">
              <label>Department / Team
                <select value={form.department} onChange={(e)=>set('department',e.target.value)}>
                  {workshopDepartments.map((department)=><option key={department.id}>{department.name}</option>)}
                </select>
              </label>
              <label>Shift
                <select
                  value={form.shift}
                  onChange={(e)=>set('shift',e.target.value)}
                >
                  {workshopShifts.map((shift)=><option key={shift.id} value={`${shift.name} (${shift.time})`}>{shift.name} · {shift.time}</option>)}
                </select>
              </label>
              <label>Weekly Off<input value={form.weeklyOff} onChange={(e)=>set('weeklyOff',e.target.value)}/></label>
              <label>Payment Type
                <select value={form.paymentType} onChange={(e)=>set('paymentType',e.target.value)}>
                  <option>Monthly Salary</option>
                  <option>Daily Salary</option>
                  <option>Hourly Salary</option>
                  <option>Commission</option>
                  <option>Salary + Commission</option>
                </select>
              </label>
            </div>

            <div className="staff-skill-picker">
              <span>Skills & Specialization</span>
              <div className="staff-chip-picker">
                {workshopSkills.map((skill)=>(
                  <button
                    type="button"
                    key={skill}
                    className={selectedSkills.includes(skill) ? 'is-selected' : ''}
                    onClick={()=>toggleSkill(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="staff-form-panel">
            <div className="staff-form-panel__title">Contact, ID & Notes</div>
            <div className="staff-form-grid">
              <label>Emergency Contact<input value={form.emergencyContact} onChange={(e)=>set('emergencyContact',e.target.value)} placeholder="Name · Phone"/></label>
              <label>ID Proof Status
                <select value={form.idProof} onChange={(e)=>set('idProof',e.target.value)}>
                  <option>Not uploaded</option>
                  <option>Aadhaar verified</option>
                  <option>Aadhaar + PAN verified</option>
                  <option>Driving Licence verified</option>
                </select>
              </label>
              <label className="is-wide">Address<textarea rows={3} value={form.address} onChange={(e)=>set('address',e.target.value)} placeholder="Full address"/></label>
              <label className="is-wide">Notes<textarea rows={3} value={form.notes} onChange={(e)=>set('notes',e.target.value)} placeholder="Workshop or employment notes"/></label>
            </div>
          </section>
        </div>

        <aside className="staff-add-summary">
          <div className="staff-add-summary__avatar">{form.name ? form.name.slice(0,1).toUpperCase() : 'S'}</div>
          <h3>{form.name || 'New Staff Member'}</h3>
          <p>{form.designation} · {form.department}</p>
          <div className="staff-add-summary__rows">
            <div><span>Role</span><strong>{form.role}</strong></div>
            <div><span>Branch</span><strong>{form.branch}</strong></div>
            <div><span>Shift</span><strong>{selectedShift?.name || 'Custom'}</strong></div>
            <div><span>Status</span><strong>{form.employmentStatus}</strong></div>
            <div><span>Skills</span><strong>{selectedSkills.length}</strong></div>
          </div>
        </aside>
      </div>
    </form>
  );
};
