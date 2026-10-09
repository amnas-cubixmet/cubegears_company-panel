import React from 'react';
import { BadgeCheck, CalendarCheck2, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';

/** Daily-wage-only rules. No monthly cycles, payment frequency or salary-type setup. */
export const PayrollPolicyPanel = () => (
  <section className="payroll-policy-panel">
    <header className="payroll-policy-header">
      <div className="payroll-policy-header-copy">
        <span className="payroll-policy-header-icon" aria-hidden="true"><WalletCards size={17}/></span>
        <div>
          <strong>Company Daily Wage Rules</strong>
          <span>Wages are credited per approved workday, then settled whenever the owner pays.</span>
        </div>
      </div>
      <Link to="/payroll/daily-wages" className="dw-button is-primary">
        <WalletCards size={16}/> Wage Accounts
      </Link>
    </header>
    <div className="payroll-policy-help">
      <BadgeCheck size={18} aria-hidden="true"/>
      <p>Full Day = 100% wage, Half Day = 50%, Leave / Absent / Weekly Off = ₹0.
        Approved OT, extra duty and bonuses are credited separately.
        Partial or full payments reduce outstanding balance, never the lifetime history.</p>
    </div>
    <div className="payroll-policy-help">
      <CalendarCheck2 size={18} aria-hidden="true"/>
      <p>Every employee has an effective-dated daily rate. Edit it from the Staff Wage Account.
        Earnings are posted only after attendance is finalized.</p>
    </div>
  </section>
);
