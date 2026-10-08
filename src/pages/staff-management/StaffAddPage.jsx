import React, { useEffect, useMemo, useState } from 'react';
import { Save, UserPlus, WalletCards, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { roleService } from '../../services/role.service';
import { staffService } from '../../services/staff.service';
import { staffManagementService } from '../../services/staffManagement.service';
import { branchService } from '../../services/branch.service';
import { BranchCreateSheet } from '../../components/staff-management/BranchCreateSheet';

const statusOptions = [
  'Active',
  'Probation',
  'Notice Period',
  'Suspended',
  'Resigned',
  'Terminated',
  'Inactive',
];

const paymentTypes = [
  'Monthly Salary',
  'Daily Salary',
  'Hourly Salary',
  'Commission',
  'Salary + Commission',
];

const today = () => new Date().toISOString().slice(0, 10);

export const StaffAddPage = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState('');
  const [roles, setRoles] = useState([]);
  const [teams, setTeams] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchSheetOpen, setBranchSheetOpen] = useState(false);
  const [setSalaryNow, setSetSalaryNow] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    designation: 'Mechanic',
    role: '',
    teamId: '',
    shiftId: '',
    branchId: '',
    joiningDate: today(),
    employmentStatus: 'Active',
    weeklyOff: 'Sunday',
    emergencyContact: '',
    address: '',
    paymentType: 'Monthly Salary',
    notes: '',
  });

  const [salary, setSalary] = useState({
    salaryBasis: 'Monthly',
    basicSalary: '',
    hra: '',
    allowances: '',
    deductions: '',
    overtimeRate: '',
    fixedIncentive: '',
    effectiveDate: today(),
  });

  useEffect(() => {
    let alive = true;

    Promise.all([
      roleService.getRoles(),
      staffManagementService.getTeams(),
      staffManagementService.getShifts(),
      branchService.getBranches(),
    ])
      .then(([roleRows, teamRows, shiftRows, branchRows]) => {
        if (!alive) return;

        const activeRoles = (Array.isArray(roleRows) ? roleRows : []).filter(
          (role) => role.status !== 'Inactive',
        );
        const nextTeams = Array.isArray(teamRows) ? teamRows : [];
        const nextShifts = Array.isArray(shiftRows) ? shiftRows : [];
        const nextBranches = (Array.isArray(branchRows) ? branchRows : []).filter(
          (item) => item.is_active !== false,
        );

        setRoles(activeRoles);
        setTeams(nextTeams);
        setShifts(nextShifts);
        setBranches(nextBranches);

        setForm((current) => ({
          ...current,
          role: current.role || activeRoles[0]?.name || 'Mechanic',
          teamId: current.teamId || nextTeams[0]?.id || '',
          shiftId: current.shiftId || nextShifts[0]?.id || '',
          branchId: current.branchId || nextBranches[0]?.id || '',
        }));
      })
      .catch((requestError) => {
        if (alive) {
          setError(requestError?.message || 'Unable to load staff setup options.');
        }
      })
      .finally(() => {
        if (alive) setLoadingOptions(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const selectedTeam = useMemo(
    () => teams.find((team) => String(team.id) === String(form.teamId)),
    [teams, form.teamId],
  );

  const selectedShift = useMemo(
    () => shifts.find((shift) => String(shift.id) === String(form.shiftId)),
    [shifts, form.shiftId],
  );

  const selectedBranch = useMemo(
    () => branches.find((item) => String(item.id) === String(form.branchId)),
    [branches, form.branchId],
  );

  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || saving) return;

    setSaving(true);
    setError('');

    try {
      const created = await staffService.createStaff({
        ...form,
        department: selectedTeam?.name || '',
        shift: '',
        teamId: form.teamId || null,
        shiftId: form.shiftId || null,
        branchId: form.branchId || null,
        setSalaryNow: setSalaryNow && form.paymentType !== 'Commission',
        salarySetup:
          setSalaryNow && form.paymentType !== 'Commission'
            ? {
                ...salary,
                basicSalary: Number(salary.basicSalary || 0),
                hra: Number(salary.hra || 0),
                totalAllowances: Number(salary.allowances || 0),
                deductions: Number(salary.deductions || 0),
                overtimeRate: Number(salary.overtimeRate || 0),
                fixedIncentive: Number(salary.fixedIncentive || 0),
              }
            : null,
      });

      navigate(
        created?.id
          ? `/staff-management/staff/${created.id}`
          : '/staff-management/staff',
      );
    } catch (requestError) {
      setError(requestError?.message || 'Unable to create staff.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <form className="staff-add-page" onSubmit={submit}>
      <section className="staff-add-page__header">
        <div>
          <h2>Add Staff</h2>
          <p>Create profile, role access, branch, team, shift and payroll setup together.</p>
        </div>
        <button className="staff-save-button" type="submit" disabled={saving || loadingOptions}>
          <Save size={15} />
          {saving ? 'Saving...' : 'Save Staff'}
        </button>
      </section>

      {error && <div className="staff-directory-message is-error">{error}</div>}

      <div className="staff-add-layout">
        <div className="staff-add-main">
          <section className="staff-form-panel">
            <div className="staff-form-panel__title">
              <UserPlus size={16} />
              Personal & Employment
            </div>

            <div className="staff-form-grid">
              <label>
                Full Name *
                <input
                  required
                  value={form.name}
                  onChange={(event) => set('name', event.target.value)}
                  placeholder="Staff full name"
                />
              </label>

              <label>
                Phone *
                <input
                  required
                  value={form.phone}
                  onChange={(event) => set('phone', event.target.value)}
                  placeholder="+91 ..."
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => set('email', event.target.value)}
                  placeholder="name@company.com"
                />
              </label>

              <label>
                Designation
                <input
                  value={form.designation}
                  onChange={(event) => set('designation', event.target.value)}
                />
              </label>

              <label>
                System Role
                <select
                  value={form.role}
                  onChange={(event) => set('role', event.target.value)}
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Employment Status
                <select
                  value={form.employmentStatus}
                  onChange={(event) => set('employmentStatus', event.target.value)}
                >
                  {statusOptions.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>

              <label>
                Joining Date
                <input
                  type="date"
                  value={form.joiningDate}
                  onChange={(event) => set('joiningDate', event.target.value)}
                />
              </label>

              <label>
                Branch
                <div className="staff-branch-select-row">
                  <select
                    value={form.branchId}
                    onChange={(event) => set('branchId', event.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {branches.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="staff-inline-create-button"
                    onClick={() => setBranchSheetOpen(true)}
                  >
                    + Branch
                  </button>
                </div>
              </label>
            </div>
          </section>

          <section className="staff-form-panel">
            <div className="staff-form-panel__title">
              <Wrench size={16} />
              Workshop Assignment
            </div>

            <div className="staff-form-grid">
              <label>
                Team / Department
                <select
                  value={form.teamId}
                  onChange={(event) => set('teamId', event.target.value)}
                >
                  <option value="">Unassigned</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Shift
                <select
                  value={form.shiftId}
                  onChange={(event) => set('shiftId', event.target.value)}
                >
                  <option value="">Unassigned</option>
                  {shifts.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.name}
                      {shift.time ? ` · ${shift.time}` : ''}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Weekly Off
                <input
                  value={form.weeklyOff}
                  onChange={(event) => set('weeklyOff', event.target.value)}
                />
              </label>

              <label>
                Payment Type
                <select
                  value={form.paymentType}
                  onChange={(event) => set('paymentType', event.target.value)}
                >
                  {paymentTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
            </div>

          </section>

          <section className="staff-form-panel">
            <div className="staff-form-panel__title">Contact & Notes</div>
            <div className="staff-form-grid">
              <label>
                Emergency Contact
                <input
                  value={form.emergencyContact}
                  onChange={(event) => set('emergencyContact', event.target.value)}
                  placeholder="Name · Phone"
                />
              </label>

              <label className="is-wide">
                Address
                <textarea
                  rows={3}
                  value={form.address}
                  onChange={(event) => set('address', event.target.value)}
                />
              </label>

              <label className="is-wide">
                Notes
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(event) => set('notes', event.target.value)}
                />
              </label>
            </div>
          </section>

          {form.paymentType !== 'Commission' && (
            <section className="staff-form-panel">
              <div className="staff-form-panel__title">
                <WalletCards size={16} />
                Initial Payroll Setup
              </div>

              <label className="staff-salary-toggle">
                <span>
                  <strong>Set salary now</strong>
                  <small>Optional. Salary can also be configured later from Payroll.</small>
                </span>
                <input
                  type="checkbox"
                  checked={setSalaryNow}
                  onChange={(event) => setSetSalaryNow(event.target.checked)}
                />
              </label>

              {setSalaryNow && (
                <div className="staff-form-grid staff-salary-grid">
                  <label>
                    Salary Basis
                    <select
                      value={salary.salaryBasis}
                      onChange={(event) =>
                        setSalary((current) => ({
                          ...current,
                          salaryBasis: event.target.value,
                        }))
                      }
                    >
                      <option>Monthly</option>
                      <option>Daily</option>
                      <option>Hourly</option>
                    </select>
                  </label>

                  <label>
                    Base Salary / Rate
                    <input
                      type="number"
                      min="0"
                      value={salary.basicSalary}
                      onChange={(event) =>
                        setSalary((current) => ({
                          ...current,
                          basicSalary: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label>
                    HRA
                    <input
                      type="number"
                      min="0"
                      value={salary.hra}
                      onChange={(event) =>
                        setSalary((current) => ({
                          ...current,
                          hra: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label>
                    Other Allowances
                    <input
                      type="number"
                      min="0"
                      value={salary.allowances}
                      onChange={(event) =>
                        setSalary((current) => ({
                          ...current,
                          allowances: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label>
                    Deductions
                    <input
                      type="number"
                      min="0"
                      value={salary.deductions}
                      onChange={(event) =>
                        setSalary((current) => ({
                          ...current,
                          deductions: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label>
                    Overtime Rate
                    <input
                      type="number"
                      min="0"
                      value={salary.overtimeRate}
                      onChange={(event) =>
                        setSalary((current) => ({
                          ...current,
                          overtimeRate: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label>
                    Fixed Incentive
                    <input
                      type="number"
                      min="0"
                      value={salary.fixedIncentive}
                      onChange={(event) =>
                        setSalary((current) => ({
                          ...current,
                          fixedIncentive: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label>
                    Effective From
                    <input
                      type="date"
                      value={salary.effectiveDate}
                      onChange={(event) =>
                        setSalary((current) => ({
                          ...current,
                          effectiveDate: event.target.value,
                        }))
                      }
                    />
                  </label>
                </div>
              )}
            </section>
          )}
        </div>

        <aside className="staff-add-summary">
          <div className="staff-add-summary__avatar">
            {form.name ? form.name.slice(0, 1).toUpperCase() : 'S'}
          </div>
          <h3>{form.name || 'New Staff Member'}</h3>
          <p>{form.designation} · {selectedTeam?.name || 'Unassigned Team'}</p>

          <div className="staff-add-summary__rows">
            <div><span>Role</span><strong>{form.role || 'Not selected'}</strong></div>
            <div><span>Branch</span><strong>{selectedBranch?.name || 'Unassigned'}</strong></div>
            <div><span>Shift</span><strong>{selectedShift?.name || 'Unassigned'}</strong></div>
            <div><span>Status</span><strong>{form.employmentStatus}</strong></div>
            <div><span>Salary Setup</span><strong>{setSalaryNow ? 'Configured' : 'Later'}</strong></div>
          </div>
        </aside>
      </div>

      </form>

      <BranchCreateSheet
        isOpen={branchSheetOpen}
        onClose={() => setBranchSheetOpen(false)}
        onCreate={async (data) => {
          const created = await branchService.createBranch(data);
          const next = await branchService.getBranches();
          setBranches(next.filter((item) => item.is_active !== false));
          if (created?.id) set('branchId', created.id);
        }}
      />
    </>
  );
};
