import React, { useEffect, useMemo, useState } from 'react';
import { Save, UserPlus, WalletCards, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { roleService } from '../../services/role.service';
import { staffService } from '../../services/staff.service';
import { staffManagementService } from '../../services/staffManagement.service';
import { branchService } from '../../services/branch.service';
import { BranchCreateSheet } from '../../components/staff-management/BranchCreateSheet';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';
import { PAY_TYPES, hasCommission, hasDailyBase, hasHourlyBase, hasMonthlyBase } from '../../components/payroll/payTypes';

const statusOptions = [
  'Active',
  'Probation',
  'Notice Period',
  'Suspended',
  'Resigned',
  'Terminated',
  'Inactive',
];

const today = () => new Date().toISOString().slice(0, 10);

export const StaffAddPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManageBranches = hasPermission(user, 'company.manage');
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
    emergencyContact: '',
    address: '',
    paymentType: 'monthly',
    notes: '',
  });

  const [salary, setSalary] = useState({
    baseSalary: '',
    dailyWageRate: '',
    hourlyWageRate: '',
    commissionType: 'percentage',
    commissionPercentage: '',
    commissionFixedAmount: '',
    eligibleRevenueBasis: 'labour_revenue',
    deductions: '',
    fixedIncentive: '',
    effectiveDate: today(),
    paymentFrequency: 'monthly',
    overtimeEligibility: true,
    incentiveEligibility: true,
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
        setSalaryNow,
        salarySetup:
          setSalaryNow
            ? {
                ...salary,
                paymentType: form.paymentType,
                baseSalary: Number(salary.baseSalary || 0),
                dailyWageRate: Number(salary.dailyWageRate || 0),
                hourlyWageRate: Number(salary.hourlyWageRate || 0),
                commissionPercentage: Number(salary.commissionPercentage || 0),
                commissionFixedAmount: Number(salary.commissionFixedAmount || 0),
                deductions: Number(salary.deductions || 0),
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
                  {canManageBranches && (
                    <button
                      type="button"
                      className="staff-inline-create-button"
                      onClick={() => setBranchSheetOpen(true)}
                    >
                      + Branch
                    </button>
                  )}
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
                  value={selectedShift?.weeklyOff || 'Defined by shift'}
                  readOnly
                />
              </label>

              <label>
                Payment Type
                <select
                  value={form.paymentType}
                  onChange={(event) => set('paymentType', event.target.value)}
                >
                  {PAY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
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

          <section className="staff-form-panel">
            <div className="staff-form-panel__title">
              <WalletCards size={16} />
              Initial Salary & Payment Settings
            </div>

            <label className="staff-salary-toggle">
              <span>
                <strong>Configure payment now</strong>
                <small>Optional. You can also configure or revise it later from the employee Payroll tab.</small>
              </span>
              <input
                type="checkbox"
                checked={setSalaryNow}
                onChange={(event) => setSetSalaryNow(event.target.checked)}
              />
            </label>

            {setSalaryNow && (
              <div className="staff-form-grid staff-salary-grid">
                {hasMonthlyBase(form.paymentType) && (
                  <label>
                    Monthly Base Salary
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={salary.baseSalary}
                      onChange={(event) => setSalary((current) => ({ ...current, baseSalary: event.target.value }))}
                    />
                  </label>
                )}

                {hasDailyBase(form.paymentType) && (
                  <label>
                    Daily Wage Rate
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={salary.dailyWageRate}
                      onChange={(event) => setSalary((current) => ({ ...current, dailyWageRate: event.target.value }))}
                    />
                  </label>
                )}

                {hasHourlyBase(form.paymentType) && (
                  <label>
                    Hourly Wage Rate
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={salary.hourlyWageRate}
                      onChange={(event) => setSalary((current) => ({ ...current, hourlyWageRate: event.target.value }))}
                    />
                  </label>
                )}

                {hasCommission(form.paymentType) && (
                  <>
                    <label>
                      Commission Type
                      <select
                        value={salary.commissionType}
                        onChange={(event) => setSalary((current) => ({ ...current, commissionType: event.target.value }))}
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed per eligible Job Card</option>
                      </select>
                    </label>

                    {salary.commissionType === 'percentage' ? (
                      <label>
                        Commission %
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={salary.commissionPercentage}
                          onChange={(event) => setSalary((current) => ({ ...current, commissionPercentage: event.target.value }))}
                        />
                      </label>
                    ) : (
                      <label>
                        Fixed Commission
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={salary.commissionFixedAmount}
                          onChange={(event) => setSalary((current) => ({ ...current, commissionFixedAmount: event.target.value }))}
                        />
                      </label>
                    )}

                    <label>
                      Commission Based On
                      <select
                        value={salary.eligibleRevenueBasis}
                        onChange={(event) => setSalary((current) => ({ ...current, eligibleRevenueBasis: event.target.value }))}
                      >
                        <option value="labour_revenue">Labour Revenue</option>
                        <option value="service_revenue">Service Revenue</option>
                        <option value="job_card">Job Card Revenue</option>
                        <option value="custom">Custom Eligible Revenue</option>
                      </select>
                    </label>
                  </>
                )}

                {form.paymentType === 'salary_incentive' && (
                  <label>
                    Fixed Job Incentive / Bonus
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={salary.fixedIncentive}
                      onChange={(event) => setSalary((current) => ({ ...current, fixedIncentive: event.target.value }))}
                    />
                  </label>
                )}

                <label>
                  Fixed Deduction
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={salary.deductions}
                    onChange={(event) => setSalary((current) => ({ ...current, deductions: event.target.value }))}
                  />
                </label>

                <label>
                  Payment Frequency
                  <select
                    value={salary.paymentFrequency}
                    onChange={(event) => setSalary((current) => ({ ...current, paymentFrequency: event.target.value }))}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="daily">Daily settlement</option>
                  </select>
                </label>

                <label>
                  Effective From
                  <input
                    type="date"
                    value={salary.effectiveDate}
                    onChange={(event) => setSalary((current) => ({ ...current, effectiveDate: event.target.value }))}
                  />
                </label>

                <label className="staff-salary-toggle">
                  <span><strong>Overtime Eligible</strong><small>Approved OT may enter payroll.</small></span>
                  <input
                    type="checkbox"
                    checked={salary.overtimeEligibility}
                    onChange={(event) => setSalary((current) => ({ ...current, overtimeEligibility: event.target.checked }))}
                  />
                </label>

                <label className="staff-salary-toggle">
                  <span><strong>Incentive Eligible</strong><small>Approved incentives may enter payroll.</small></span>
                  <input
                    type="checkbox"
                    checked={salary.incentiveEligibility}
                    onChange={(event) => setSalary((current) => ({ ...current, incentiveEligibility: event.target.checked }))}
                  />
                </label>

                {form.paymentType === 'hybrid' && (
                  <div className="staff-directory-message">
                    Save the employee first, then open the Payroll tab to add custom hybrid earning/deduction components.
                  </div>
                )}
              </div>
            )}
          </section>
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
        isOpen={canManageBranches && branchSheetOpen}
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
