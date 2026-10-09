import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { ResponsiveModalSheet } from '../common/ResponsiveModalSheet';
import {
  PAY_TYPES,
  LEGACY_PAY_TYPES,
  hasCommission,
  hasDailyBase,
  hasHourlyBase,
  hasMonthlyBase,
  payTypeLabel,
} from './payTypes';

const today = () => new Date().toISOString().slice(0, 10);

const emptyComponent = () => ({
  name: '',
  code: '',
  kind: 'earning',
  calculationType: 'fixed',
  amount: '',
  percentage: '',
  taxable: true,
});

const initialForm = (structure) => {
  const editingExisting = Boolean(structure?.id);
  return {
    id: editingExisting ? undefined : structure?.id,
    originalPlanId: structure?.id || null,
    originalEffectiveDate: structure?.effectiveDate || structure?.effective_from || null,
    staffId: structure?.staffId || structure?.employee?.id || '',
    staffName: structure?.staffName || structure?.employee?.name || '',
    paymentType: structure?.paymentType || 'monthly',
    baseSalary: structure?.baseSalary ?? structure?.fixedMonthlySalary ?? structure?.basicSalary ?? '',
    dailyWageRate: structure?.dailyWageRate ?? structure?.dailyRate ?? '',
    hourlyWageRate: structure?.hourlyWageRate ?? structure?.hourlyRate ?? '',
    commissionType: structure?.commissionType || 'percentage',
    commissionPercentage: structure?.commissionPercentage ?? '',
    commissionFixedAmount: structure?.commissionFixedAmount ?? '',
    eligibleRevenueBasis: structure?.eligibleRevenueBasis || 'labour_revenue',
    overtimeEligibility: structure?.overtimeEligibility !== false,
    incentiveEligibility: structure?.incentiveEligibility !== false,
    fixedBonus: structure?.bonusRules?.fixedAmount ?? structure?.fixedIncentives ?? '',
    fixedDeduction: Array.isArray(structure?.applicableDeductions)
      ? structure.applicableDeductions.reduce((sum, item) => sum + Number(item.amount || 0), 0)
      : '',
    effectiveDate: editingExisting ? today() : (structure?.effectiveDate || today()),
    effectiveTo: '',
    paymentFrequency: 'daily', // Daily wage accrual only; payouts can be settled on any date.
    approvalStatus: structure?.approvalStatus || 'Approved',
    notes: structure?.notes || '',
    components: Array.isArray(structure?.components) && structure.components.length
      ? structure.components.map((item) => ({ ...item }))
      : [emptyComponent()],
  };
};

export const EmployeePayConfigurationSheet = ({
  isOpen,
  onClose,
  structure,
  onSave,
}) => {
  const [form, setForm] = useState(initialForm(structure));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm(structure));
      setSaveError('');
    }
  }, [isOpen, structure?.id, structure?.staffId, structure?.employee?.id, structure?.paymentType]);

  const type = form.paymentType;
  const commissionEnabled = hasCommission(type);
  const isHybrid = type === 'hybrid';

  const selectedSummary = useMemo(() => {
    if (type === 'commission') {
      return form.commissionType === 'fixed'
        ? 'Fixed commission per eligible Job Card'
        : (Number(form.commissionPercentage || 0) + '% of eligible ' + form.eligibleRevenueBasis.replaceAll('_', ' '));
    }
    if (type === 'monthly_commission') return 'Monthly salary + approved Job Card commission';
    if (type === 'daily_commission') return 'Approved payable days × daily rate + commission';
    if (type === 'hourly_commission') return 'Approved payable hours × hourly rate + commission';
    if (type === 'salary_incentive') return 'Monthly salary + approved incentive / bonus';
    if (type === 'hybrid') return 'Custom earning and deduction components';
    if (type === 'per_job') return 'Fixed worker charge per approved Job Card work. Customer labour charge is set separately on the Job Card.';
    return payTypeLabel(type);
  }, [type, form.commissionType, form.commissionPercentage, form.eligibleRevenueBasis]);

  if (!isOpen || !structure) return null;

  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }));

  const updateComponent = (index, key, value) => {
    setForm((old) => ({
      ...old,
      components: old.components.map((item, position) =>
        position === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addComponent = () =>
    setForm((old) => ({ ...old, components: [...old.components, emptyComponent()] }));

  const removeComponent = (index) =>
    setForm((old) => ({
      ...old,
      components: old.components.filter((_, position) => position !== index),
    }));

  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;

    const deductions = Number(form.fixedDeduction || 0) > 0
      ? [{
          code: 'FIXED_DEDUCTION',
          name: 'Fixed Payroll Deduction',
          amount: Number(form.fixedDeduction || 0),
        }]
      : [];

    setSaving(true);
    setSaveError('');
    try {
      const updateExistingPlan = Boolean(
        form.originalPlanId &&
        form.originalEffectiveDate &&
        form.effectiveDate === form.originalEffectiveDate
      );
      await onSave({
        ...form,
        paymentFrequency: 'daily',
        // A same-day change can update an unused plan. A later effective
        // date creates a new revision; used plans are protected by the API.
        id: updateExistingPlan ? form.originalPlanId : undefined,
        employee: form.staffId,
        baseSalary: hasMonthlyBase(type) ? Number(form.baseSalary || 0) : 0,
        dailyWageRate: hasDailyBase(type) ? Number(form.dailyWageRate || 0) : 0,
        hourlyWageRate: hasHourlyBase(type) ? Number(form.hourlyWageRate || 0) : 0,
        commissionType: commissionEnabled ? form.commissionType : 'none',
        overtimeEligibility: type !== 'per_job' && form.overtimeEligibility,
        incentiveEligibility: type !== 'per_job' && form.incentiveEligibility,
        commissionPercentage:
          commissionEnabled && form.commissionType === 'percentage'
            ? Number(form.commissionPercentage || 0)
            : 0,
        commissionFixedAmount:
          commissionEnabled && form.commissionType === 'fixed'
            ? Number(form.commissionFixedAmount || 0)
            : 0,
        bonusRules: { fixedAmount: Number(form.fixedBonus || 0) },
        applicableDeductions: deductions,
        components: isHybrid ? form.components : [],
        effectiveTo: form.effectiveTo || null,
      });
      onClose();
    } catch (error) {
      const details = error?.response?.data;
      const message = details?.message || details?.non_field_errors?.[0] || error?.message || 'Unable to save pay configuration.';
      setSaveError(typeof message === 'string' ? message : 'Unable to save pay configuration. Check rate and effective date.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveModalSheet
      isOpen={isOpen}
      onClose={onClose}
      title={'Salary & Payment Settings · ' + form.staffName}
      maxWidth="720px"
    >
      <form className="employee-pay-config-form" onSubmit={submit}>
        {form.originalPlanId && (
          <div className="pay-config-revision-note">
            {form.originalEffectiveDate === form.effectiveDate
              ? 'Updating the existing plan for this effective date. Plans already used by payroll cannot be edited.'
              : 'A new effective-dated revision will be created. Historical payroll stays unchanged.'}
          </div>
        )}

        <label className="pay-config-field is-wide">
          <span>Payment Type *</span>
          <select value={form.paymentType} onChange={(e) => set('paymentType', e.target.value)}>
            {PAY_TYPES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
            {!PAY_TYPES.some((item) => item.value === form.paymentType) && (
              <option value={form.paymentType}>{LEGACY_PAY_TYPES.find((item) => item.value === form.paymentType)?.label || 'Previous Payment Type'}</option>
            )}
          </select>
          <small>{selectedSummary}</small>
        </label>

        <div className="pay-config-form-grid">
          {hasMonthlyBase(type) && (
            <label className="pay-config-field">
              <span>Base Monthly Salary (₹) *</span>
              <input type="number" min="0" step="0.01" required value={form.baseSalary} onChange={(e) => set('baseSalary', e.target.value)} />
            </label>
          )}

          {hasDailyBase(type) && (
            <label className="pay-config-field">
              <span>Daily Wage Rate (₹ / day) *</span>
              <input type="number" min="0" step="0.01" required value={form.dailyWageRate} onChange={(e) => set('dailyWageRate', e.target.value)} />
            </label>
          )}

          {hasHourlyBase(type) && (
            <label className="pay-config-field">
              <span>Hourly Wage Rate (₹ / hour) *</span>
              <input type="number" min="0" step="0.01" required value={form.hourlyWageRate} onChange={(e) => set('hourlyWageRate', e.target.value)} />
            </label>
          )}

          {commissionEnabled && (
            <>
              <label className="pay-config-field">
                <span>Commission Type *</span>
                <select value={form.commissionType} onChange={(e) => set('commissionType', e.target.value)}>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed amount per eligible Job Card</option>
                </select>
              </label>

              {form.commissionType === 'percentage' ? (
                <label className="pay-config-field">
                  <span>Commission Rate (%) *</span>
                  <input type="number" min="0" max="100" step="0.01" required value={form.commissionPercentage} onChange={(e) => set('commissionPercentage', e.target.value)} />
                </label>
              ) : (
                <label className="pay-config-field">
                  <span>Fixed Commission (₹) *</span>
                  <input type="number" min="0" step="0.01" required value={form.commissionFixedAmount} onChange={(e) => set('commissionFixedAmount', e.target.value)} />
                </label>
              )}

              <label className="pay-config-field">
                <span>Commission Based On *</span>
                <select value={form.eligibleRevenueBasis} onChange={(e) => set('eligibleRevenueBasis', e.target.value)}>
                  <option value="labour_revenue">Labour Revenue</option>
                  <option value="service_revenue">Service Revenue</option>
                  <option value="job_card">Job Card Revenue</option>
                  <option value="custom">Custom Eligible Revenue</option>
                </select>
              </label>
            </>
          )}

          {type === 'salary_incentive' && (
            <label className="pay-config-field">
              <span>Fixed Job Incentive / Bonus (₹)</span>
              <input type="number" min="0" step="0.01" value={form.fixedBonus} onChange={(e) => set('fixedBonus', e.target.value)} />
            </label>
          )}

          <label className="pay-config-field">
            <span>Fixed Deduction (₹)</span>
            <input type="number" min="0" step="0.01" value={form.fixedDeduction} onChange={(e) => set('fixedDeduction', e.target.value)} />
          </label>

          <label className="pay-config-field">
            <span>Payment Frequency</span>
            <select value="daily" disabled aria-label="Payment Frequency">
              <option value="daily">Daily</option>
            </select>
            <small>Wages accrue daily. Pay the outstanding balance whenever required.</small>
          </label>

          <label className="pay-config-field">
            <span>Effective Date *</span>
            <input type="date" required value={form.effectiveDate} onChange={(e) => set('effectiveDate', e.target.value)} />
          </label>

          <label className="pay-config-field">
            <span>Approval Status</span>
            <select value={form.approvalStatus} onChange={(e) => set('approvalStatus', e.target.value)}>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending Approval</option>
            </select>
          </label>
        </div>

        <div className="pay-config-toggle-grid">
          <label>
            <span><strong>Overtime Eligible</strong><small>Approved overtime may enter payroll.</small></span>
            <input type="checkbox" checked={form.overtimeEligibility} onChange={(e) => set('overtimeEligibility', e.target.checked)} />
          </label>
          <label>
            <span><strong>Incentive Eligible</strong><small>Approved incentives and bonuses may enter payroll.</small></span>
            <input type="checkbox" checked={form.incentiveEligibility} onChange={(e) => set('incentiveEligibility', e.target.checked)} />
          </label>
        </div>

        {isHybrid && (
          <section className="pay-config-components">
            <header>
              <div>
                <strong>Custom Compensation Components</strong>
                <span>Add multiple earning or deduction components without changing backend code.</span>
              </div>
              <button type="button" onClick={addComponent}><Plus size={13} /> Add Component</button>
            </header>

            <div className="pay-config-component-list">
              {form.components.map((component, index) => (
                <div key={component.id || index} className="pay-config-component-row">
                  <input placeholder="Component name" value={component.name} onChange={(e) => updateComponent(index, 'name', e.target.value)} />
                  <select value={component.kind} onChange={(e) => updateComponent(index, 'kind', e.target.value)}>
                    <option value="earning">Earning</option>
                    <option value="deduction">Deduction</option>
                  </select>
                  <select value={component.calculationType} onChange={(e) => updateComponent(index, 'calculationType', e.target.value)}>
                    <option value="fixed">Fixed</option>
                    <option value="per_day">Per Day</option>
                    <option value="per_hour">Per Hour</option>
                    <option value="percent">Percent of base</option>
                  </select>
                  {component.calculationType === 'percent' ? (
                    <input type="number" min="0" max="100" step="0.01" placeholder="%" value={component.percentage} onChange={(e) => updateComponent(index, 'percentage', e.target.value)} />
                  ) : (
                    <input type="number" min="0" step="0.01" placeholder="₹ amount/rate" value={component.amount} onChange={(e) => updateComponent(index, 'amount', e.target.value)} />
                  )}
                  <button type="button" className="is-danger" onClick={() => removeComponent(index)}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          </section>
        )}

        <label className="pay-config-field is-wide">
          <span>Notes</span>
          <textarea rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Reason for salary revision, special conditions, approval note…" />
        </label>

        {saveError && <div className="staff-directory-message is-error" role="alert">{saveError}</div>}

        <div className="pay-config-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" className="is-primary" disabled={saving}>
            <Save size={14} />
            {saving ? 'Saving…' : 'Save Pay Configuration'}
          </button>
        </div>
      </form>
    </ResponsiveModalSheet>
  );
};
