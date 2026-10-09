import React, { useEffect, useState } from 'react';
import { Save, Settings2 } from 'lucide-react';
import { payrollService } from '../../services/payroll.service';
import { PAY_TYPES } from './payTypes';

const defaultPolicy = {
  defaultPaymentType: 'monthly',
  payrollCycle: 'monthly',
  workingDayCalculation: 'attendance',
  overtimeRules: { multiplier: 1.5 },
  commissionRules: {
    autoApprove: false,
    eligibility: 'job_complete',
    basisMode: 'service_wise',
    hourlyWageSource: 'attendance',
  },
  approvalWorkflow: { managerApproval: true, advanceRecoveryPercent: 20 },
  paymentMethods: ['Bank Transfer', 'UPI', 'Cash', 'Cheque'],
  unpaidLeavePolicy: { monthlyDivisor: 30 },
};

export const PayrollPolicyPanel = ({ onSaved }) => {
  const [policy, setPolicy] = useState(defaultPolicy);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    payrollService.getPayrollPolicy().then((row) => {
      if (active && row) setPolicy({
        ...defaultPolicy, ...row,
        commissionRules: { ...defaultPolicy.commissionRules, ...(row.commissionRules || {}) },
      });
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const saved = await payrollService.savePayrollPolicy(policy);
      setPolicy((old) => ({ ...old, ...saved }));
      onSaved?.();
    } catch (requestError) {
      setError(requestError?.message || 'Unable to save salary and worker payment settings.');
    } finally {
      setSaving(false);
    }
  };

  const setRule = (group, key, value) =>
    setPolicy((old) => ({
      ...old,
      [group]: { ...(old[group] || {}), [key]: value },
    }));

  return (
    <section className="payroll-policy-panel">
      <header>
        <div>
          <Settings2 size={15} />
          <div>
            <strong>Company Payroll Defaults</strong>
            <span>Employee plans can override these defaults independently.</span>
          </div>
        </div>
        <button type="button" onClick={save} disabled={saving}>
          <Save size={13} />
          {saving ? 'Saving…' : 'Save Defaults'}
        </button>
      </header>

      <div className="payroll-policy-grid">
        <label>
          <span>Default Payment Type</span>
          <select
            value={policy.defaultPaymentType}
            onChange={(e) => setPolicy((old) => ({ ...old, defaultPaymentType: e.target.value }))}
          >
            {PAY_TYPES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Payroll Cycle</span>
          <select
            value={policy.payrollCycle}
            onChange={(e) => setPolicy((old) => ({ ...old, payrollCycle: e.target.value }))}
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
          </select>
        </label>

        <label>
          <span>Monthly Unpaid Leave Divisor</span>
          <input
            type="number"
            min="1"
            value={policy.unpaidLeavePolicy?.monthlyDivisor || 30}
            onChange={(e) => setRule('unpaidLeavePolicy', 'monthlyDivisor', Number(e.target.value || 30))}
          />
        </label>

        <label>
          <span>Overtime Multiplier</span>
          <input
            type="number"
            min="0"
            step="0.1"
            value={policy.overtimeRules?.multiplier || 1}
            onChange={(e) => setRule('overtimeRules', 'multiplier', Number(e.target.value || 1))}
          />
        </label>

        <label>
          <span>Advance Recovery Max %</span>
          <input
            type="number"
            min="0"
            max="100"
            value={policy.approvalWorkflow?.advanceRecoveryPercent || 20}
            onChange={(e) => setRule('approvalWorkflow', 'advanceRecoveryPercent', Number(e.target.value || 0))}
          />
        </label>

        <label>
          <span>Hourly Wage Calculation Source</span>
          <select
            value={policy.commissionRules?.hourlyWageSource || 'attendance'}
            onChange={(event) => setRule('commissionRules', 'hourlyWageSource', event.target.value)}
          >
            <option value="attendance">Approved attendance hours</option>
            <option value="approved_job_hours">Approved Job Card work hours</option>
          </select>
        </label>

      </div>
      <p className="payroll-policy-help">
        Fixed per-work payment is entered for each Job Card work item, separately from the customer's labour charge.
        Only manager-approved work is payable; monthly, daily and hourly workers keep their regular wage rules.
      </p>
      {error && <p className="staff-directory-message is-error" role="alert">{error}</p>}
    </section>
  );
};
