import React from 'react';
import { BadgeIndianRupee, CalendarDays, Percent, Settings2 } from 'lucide-react';
import { payTypeLabel } from './payTypes';

const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const primaryPay = (plan) => {
  if (!plan) return 'Not configured';
  if (plan.paymentType === 'daily' || plan.paymentType === 'daily_commission') {
    return money(plan.dailyWageRate || plan.dailyRate) + ' / day';
  }
  if (plan.paymentType === 'hourly' || plan.paymentType === 'hourly_commission') {
    return money(plan.hourlyWageRate || plan.hourlyRate) + ' / hour';
  }
  if (plan.paymentType === 'commission') {
    if (plan.commissionType === 'fixed') {
      return money(plan.commissionFixedAmount) + ' / eligible job';
    }
    return Number(plan.commissionPercentage || 0) + '% commission';
  }
  if (plan.paymentType === 'hybrid') return 'Custom components';
  return money(plan.baseSalary || plan.fixedMonthlySalary || plan.basicSalary) + ' / month';
};

export const EmployeeCompensationGrid = ({
  employees,
  plans,
  filter,
  onConfigure,
}) => {
  const rows = employees
    .map((employee) => {
      const plan = plans.find((item) => String(item.staffId) === String(employee.id));
      return { employee, plan };
    })
    .filter(({ plan }) =>
      filter === 'All' ||
      (filter === 'unconfigured' ? !plan : plan?.paymentType === filter)
    );

  if (!rows.length) {
    return <div className="pay-config-empty">No employees matched this payment type.</div>;
  }

  return (
    <div className="pay-config-grid">
      {rows.map(({ employee, plan }) => (
        <article key={employee.id} className="pay-config-card">
          <header>
            <div>
              <strong>{employee.name}</strong>
              <span>{employee.employeeId || employee.id} · {employee.designation || employee.role || 'Staff'}</span>
            </div>
            <b className={plan ? 'is-configured' : 'is-unconfigured'}>
              {plan ? payTypeLabel(plan.paymentType) : 'Not configured'}
            </b>
          </header>

          <div className="pay-config-primary">
            <BadgeIndianRupee size={15} />
            <div>
              <span>Primary Pay</span>
              <strong>{primaryPay(plan)}</strong>
            </div>
          </div>

          <div className="pay-config-meta">
            <div>
              <CalendarDays size={12} />
              <span>Effective</span>
              <strong>{plan?.effectiveDate || '—'}</strong>
            </div>
            <div>
              <Percent size={12} />
              <span>Commission</span>
              <strong>
                {plan?.commissionType === 'percentage'
                  ? Number(plan.commissionPercentage || 0) + '%'
                  : plan?.commissionType === 'fixed'
                    ? money(plan.commissionFixedAmount)
                    : 'None'}
              </strong>
            </div>
          </div>

          <button
            type="button"
            className="pay-config-edit"
            onClick={() => onConfigure({
              ...(plan || {}),
              staffId: employee.id,
              staffName: employee.name,
              employee,
            })}
          >
            <Settings2 size={13} />
            {plan ? 'Change Pay Configuration' : 'Configure Payment'}
          </button>
        </article>
      ))}
    </div>
  );
};
