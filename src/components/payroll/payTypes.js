// New CubixGear payment setup: wages or fixed payment for completed work.
// Legacy commission codes remain recognized for existing historical records.
export const PAY_TYPES = [
  { value: 'monthly', label: 'Fixed Monthly Salary', short: 'Monthly Salary' },
  { value: 'daily', label: 'Daily Wage', short: 'Daily Wage' },
  { value: 'hourly', label: 'Hourly Wage', short: 'Hourly Wage' },
  { value: 'per_job', label: 'Fixed Charge per Job Work', short: 'Per Work' },
];

export const LEGACY_PAY_TYPES = [
  { value: 'commission', label: 'Legacy Commission Only' },
  { value: 'monthly_commission', label: 'Legacy Salary + Commission' },
  { value: 'daily_commission', label: 'Legacy Daily + Commission' },
  { value: 'hourly_commission', label: 'Legacy Hourly + Commission' },
  { value: 'salary_incentive', label: 'Legacy Salary + Incentive' },
  { value: 'hybrid', label: 'Legacy Custom Compensation' },
];

export const payTypeLabel = (value) =>
  [...PAY_TYPES, ...LEGACY_PAY_TYPES].find((item) => item.value === value)?.label
  || value || 'Not configured';

export const hasMonthlyBase = (type) =>
  ['monthly', 'monthly_commission', 'salary_incentive'].includes(type);

export const hasDailyBase = (type) =>
  ['daily', 'daily_commission'].includes(type);

export const hasHourlyBase = (type) =>
  ['hourly', 'hourly_commission'].includes(type);

export const hasCommission = (type) =>
  ['commission', 'monthly_commission', 'daily_commission', 'hourly_commission'].includes(type);
