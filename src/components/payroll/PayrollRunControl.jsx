import React, { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Calculator, LockKeyhole, Send } from 'lucide-react';
import { payrollService } from '../../services/payroll.service';
import { PayrollPolicyPanel } from './PayrollPolicyPanel';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';

const MONTH_NUMBERS = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};

export const PayrollRunControl = ({
  month,
  year,
  branch,
  employees,
  onChanged,
}) => {
  const { user } = useAuth();
  const monthNumber = MONTH_NUMBERS[month] || new Date().getMonth() + 1;
  const branchId = useMemo(() => {
    if (!branch || branch === 'All') return null;
    return employees.find((item) => item.branch === branch)?.branchId || null;
  }, [branch, employees]);

  const [run, setRun] = useState(null);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const rows = await payrollService.getPayrollRuns({
        month: monthNumber,
        year,
        ...(branchId ? { branchId } : {}),
      });
      const list = Array.isArray(rows) ? rows : rows?.results || [];
      setRun(list[0] || null);
    } catch {
      setRun(null);
    }
  };

  useEffect(() => {
    load();
  }, [monthNumber, year, branchId]);

  const ensureRun = async () => {
    if (run) return run;
    const created = await payrollService.createPayrollRun({
      month: monthNumber,
      year,
      branchId,
    });
    setRun(created);
    return created;
  };

  const action = async (name) => {
    setBusy(name);
    setMessage('');
    try {
      const target = await ensureRun();
      let updated = target;
      if (name === 'calculate') updated = await payrollService.processPayrollRun(target.id);
      if (name === 'submit') updated = await payrollService.submitPayrollRun(target.id);
      if (name === 'approve') updated = await payrollService.approvePayrollRun(target.id);
      setRun(updated);
      setMessage(
        name === 'approve'
          ? 'Payroll approved and locked.'
          : name === 'submit'
            ? 'Payroll submitted for approval.'
            : 'Payroll calculated from attendance, work, commission and employee pay settings.'
      );
      await onChanged?.();
    } catch (error) {
      setMessage(error?.response?.data?.message || error?.message || 'Payroll action failed.');
    } finally {
      setBusy('');
    }
  };

  const locked = run?.approvalStatus === 'Approved' || run?.status === 'Approved';

  return (
    <div className="payroll-run-with-rules flex min-w-0 flex-col gap-3">
      {hasPermission(user, 'payroll.edit') && (
        <details className="payroll-workshop-settings">
          <summary>Workshop Wage & Job Commission Rules</summary>
          <PayrollPolicyPanel onSaved={onChanged} />
        </details>
      )}
      <section className="payroll-run-control">
      <div className="payroll-run-control-copy">
        <span>PAYROLL PROCESS</span>
        <strong>{month} {year}{branch && branch !== 'All' ? ' · ' + branch : ''}</strong>
        <small>
          {run
            ? 'Status: ' + (run.approvalStatus || run.status || 'Draft')
            : 'No payroll run created yet.'}
        </small>
      </div>

      <div className="payroll-run-control-actions">
        <button type="button" onClick={() => action('calculate')} disabled={Boolean(busy) || locked}>
          <Calculator size={13} />
          {busy === 'calculate' ? 'Calculating…' : 'Calculate Draft'}
        </button>

        <button
          type="button"
          onClick={() => action('submit')}
          disabled={Boolean(busy) || locked || !run}
        >
          <Send size={13} />
          Submit
        </button>

        <button
          type="button"
          className="is-primary"
          onClick={() => action('approve')}
          disabled={Boolean(busy) || locked || !run}
        >
          {locked ? <LockKeyhole size={13} /> : <BadgeCheck size={13} />}
          {locked ? 'Locked' : 'Approve & Lock'}
        </button>
      </div>

      {message && <div className="payroll-run-control-message">{message}</div>}
      </section>
    </div>
  );
};
