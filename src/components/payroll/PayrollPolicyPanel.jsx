import React, { useEffect, useState } from 'react';
import { BadgeCheck, Save, Settings2 } from 'lucide-react';
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
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    payrollService.getPayrollPolicy().then((row) => {
      if (active && row) setPolicy({
        ...defaultPolicy, ...row,
        commissionRules: { ...defaultPolicy.commissionRules, ...(row.commissionRules || {}) },
      });
    }).catch(() => {
      if (active) setError('Unable to load company payroll defaults. Retry by reopening this section.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const save = async () => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const saved = await payrollService.savePayrollPolicy(policy);
      setPolicy((old) => ({ ...old, ...saved }));
      onSaved?.();
      setNotice('Company payroll defaults saved.');
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
      <header className="payroll-policy-header">
        <div className="payroll-policy-header-copy">
          <span className="payroll-policy-header-icon" aria-hidden="true"><Settings2 size={17} /></span>
          <div>
            <strong>Company Payroll Defaults</strong>
            <span>Set the default salary, attendance and payment rules for your workshop.</span>
          </div>
        </div>
        <button className="payroll-policy-save" type="button" onClick={save} disabled={saving || loading}>
          <Save size={15} aria-hidden="true" />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </header>
      <div className="payroll-policy-section-heading">
        <strong>Payment & attendance settings</strong>
        <small>Applies as a company default; individual staff pay configurations take priority.</small>
      </div>

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
      <div className="payroll-policy-help">
        <BadgeCheck size={17} aria-hidden="true" />
        <p>
          Outside freelancers are recorded manually under Job Cards → Outside Labour.
          Their charges are separate from staff payroll and do not change these salary defaults.
        </p>
      </div>
      {notice && <p className="payroll-policy-notice" role="status"><BadgeCheck size={15} aria-hidden="true" />{notice}</p>}
      {error && <p className="payroll-policy-error" role="alert">{error}</p>}
    </section>
  );
};
