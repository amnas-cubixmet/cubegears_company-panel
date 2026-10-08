export const PAY_TYPES = [
  { value: 'monthly', label: 'Fixed Monthly Salary', short: 'Monthly Salary' },
  { value: 'daily', label: 'Daily Wage', short: 'Daily Wage' },
  { value: 'hourly', label: 'Hourly Wage', short: 'Hourly Wage' },
  { value: 'commission', label: 'Commission Only', short: 'Commission Only' },
  { value: 'monthly_commission', label: 'Monthly Salary + Commission', short: 'Salary + Commission' },
  { value: 'daily_commission', label: 'Daily Wage + Commission', short: 'Daily + Commission' },
  { value: 'hourly_commission', label: 'Hourly Wage + Commission', short: 'Hourly + Commission' },
  { value: 'salary_incentive', label: 'Fixed Salary + Job Incentive', short: 'Salary + Incentive' },
  { value: 'hybrid', label: 'Custom Hybrid Compensation', short: 'Custom / Mixed' },
];

export const payTypeLabel = (value) =>
  PAY_TYPES.find((item) => item.value === value)?.label || value || 'Not configured';

export const hasMonthlyBase = (type) =>
  ['monthly', 'monthly_commission', 'salary_incentive'].includes(type);

export const hasDailyBase = (type) =>
  ['daily', 'daily_commission'].includes(type);

export const hasHourlyBase = (type) =>
  ['hourly', 'hourly_commission'].includes(type);

export const hasCommission = (type) =>
  ['commission', 'monthly_commission', 'daily_commission', 'hourly_commission'].includes(type);
