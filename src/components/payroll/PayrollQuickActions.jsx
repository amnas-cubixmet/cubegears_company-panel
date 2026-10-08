import React from 'react';
import { ArrowRight, Banknote, FileText, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const actions = [
  ['Salary Setup', '/payroll/salary-setup', Settings2],
  ['Advances', '/payroll/advances', Banknote],
  ['Reports', '/payroll/reports', FileText],
];

export const PayrollQuickActions = () => {
  const navigate = useNavigate();

  return (
    <article className="payroll-dashboard-panel">
      <header className="payroll-dashboard-panel-title">
        <div>
          <h2>Quick Actions</h2>
          <p>Common payroll operations.</p>
        </div>
        <Settings2 size={15} />
      </header>

      <div className="payroll-dashboard-quick-actions">
        {actions.map(([label, path, Icon]) => (
          <button key={path} type="button" onClick={() => navigate(path)}>
            <span><Icon size={12} />{label}</span>
            <ArrowRight size={12} />
          </button>
        ))}
      </div>
    </article>
  );
};
