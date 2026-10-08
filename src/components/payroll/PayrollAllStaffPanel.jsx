import React, { useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { payTypeLabel } from './payTypes';

const money = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(Number(value || 0));

const rateLabel = (plan) => {
  if (!plan) return 'Not configured';
  const type = plan.paymentType;
  if (['daily', 'daily_commission'].includes(type)) {
    return money(plan.dailyWageRate ?? plan.dailyRate) + ' / day';
  }
  if (['hourly', 'hourly_commission'].includes(type)) {
    return money(plan.hourlyWageRate ?? plan.hourlyRate) + ' / hour';
  }
  if (type === 'commission') return 'Commission only';
  if (type === 'hybrid') return 'Custom components';
  return money(plan.baseSalary ?? plan.fixedMonthlySalary ?? plan.basicSalary) + ' / month';
};

const commissionLabel = (plan) => {
  if (!plan || !plan.commissionType || plan.commissionType === 'none') return '—';
  if (plan.commissionType === 'fixed') return money(plan.commissionFixedAmount) + ' / job';
  return Number(plan.commissionPercentage || 0) + '%';
};

const employeeKey = (employee) => String(employee.id ?? employee.staffId ?? employee.employeeId ?? '');
const payrollKey = (record) => String(record.staffId ?? record.employeeId ?? record.employee ?? '');
const salaryKey = (plan) => String(plan.staffId ?? plan.employee ?? '');

export const PayrollAllStaffPanel = ({
  employees = [], plans = [], payrolls = [], loading = false, periodString = '',
  onConfigure, onViewPayslip, title = 'All Staff Earnings',
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [status, setStatus] = useState('all');
  const records = useMemo(() => new Map(payrolls.map((row) => [payrollKey(row), row])), [payrolls]);
  const configurations = useMemo(() => new Map(plans.map((row) => [salaryKey(row), row])), [plans]);
  const rows = useMemo(() => employees.map((employee) => ({
    employee, plan: configurations.get(employeeKey(employee)),
    payroll: records.get(employeeKey(employee)),
  })).filter(({ employee, plan, payroll }) => {
    const value = [employee.name, employee.employeeId, employee.id, employee.designation, employee.role, employee.branch]
      .filter(Boolean).join(' ').toLowerCase();
    if (search.trim() && !value.includes(search.trim().toLowerCase())) return false;
    if (status !== 'all' && String(employee.employmentStatus || '').toLowerCase() !== status) return false;
    if (filter === 'unconfigured') return !plan;
    if (filter === 'not-calculated') return !payroll;
    if (filter === 'calculated') return Boolean(payroll);
    return true;
  }), [employees, configurations, records, search, filter, status]);

  return (
    <section className="payroll-all-staff" aria-label="All staff earnings">
      <header className="payroll-all-staff__header">
        <div>
          <h2><Users size={17} /> {title}</h2>
          <p>Payment structure and calculated earnings for {periodString}. Staff without a payroll run remain visible.</p>
        </div>
        <strong className="payroll-all-staff__count">{rows.length} / {employees.length} staff</strong>
      </header>

      <div className="payroll-all-staff__toolbar">
        <label className="payroll-all-staff__search">
          <Search size={16} />
          <input
            type="search"
            aria-label="Search payroll staff"
            placeholder="Search staff name, ID, role or branch"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <select aria-label="Filter payroll staff" value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="all">All Staff</option>
          <option value="calculated">Calculated</option>
          <option value="not-calculated">Not Calculated</option>
          <option value="unconfigured">Payment Not Configured</option>
        </select>
        <select aria-label="Filter employment status" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All Employment Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on leave">On Leave</option>
        </select>
      </div>

      {loading ? (
        <p className="payroll-all-staff__empty">Loading staff payroll…</p>
      ) : rows.length === 0 ? (
        <p className="payroll-all-staff__empty">No staff match the selected filters.</p>
      ) : (
        <div className="payroll-all-staff__scroll">
          <table>
            <thead>
              <tr>
                <th>Staff</th><th>Status</th><th>Pay Type</th><th>Base Rate</th><th>Job Commission</th>
                <th>Gross Earnings</th><th>Net Pay</th><th>Paid</th><th>Balance</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ employee, plan, payroll }) => (
                <tr key={employeeKey(employee)}>
                  <td>
                    <strong>{employee.name || 'Staff member'}</strong>
                    <small>{employee.employeeId || employee.id} · {employee.designation || employee.role || 'Staff'}</small>
                  </td>
                  <td>{employee.employmentStatus || 'Not set'}</td>
                  <td>{plan ? payTypeLabel(plan.paymentType) : employee.paymentType ? payTypeLabel(employee.paymentType) + ' (setup pending)' : 'Not configured'}</td>
                  <td>{rateLabel(plan)}</td>
                  <td>{commissionLabel(plan)}</td>
                  <td>{payroll ? money(payroll.grossSalary ?? payroll.gross) : 'Not calculated'}</td>
                  <td>{payroll ? money(payroll.netSalary ?? payroll.net) : '—'}</td>
                  <td>{payroll ? money(payroll.paidAmount) : '—'}</td>
                  <td>{payroll ? money(Math.max(0, Number(payroll.netSalary ?? payroll.net ?? 0) - Number(payroll.paidAmount || 0))) : '—'}</td>
                  <td className="payroll-all-staff__actions">
                    <button type="button" onClick={() => onConfigure?.({
                      ...(plan || {}), staffId: employee.id, staffName: employee.name, employee,
                    })}>{plan ? 'Edit Pay' : 'Set Up Pay'}</button>
                    {payroll && (
                      <button type="button" onClick={() => onViewPayslip?.(payroll)}>
                        View Payslip
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
