import React from 'react';
import { ShieldCheck, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';

export const AttendanceManagerHeader = () => {
  const { user } = useAuth();
  return (
  <header className="attendance-manager-dashboard-header">
    <div>
      <h1>Attendance Manager</h1>
      <p>Team attendance, shifts, leave and company attendance rules.</p>
    </div>

    <div className="attendance-manager-header-actions">
      {hasPermission(user, 'payroll.view') && (
        <Link className="dw-button" to="/payroll/daily-wages">
          <WalletCards size={15} /> Daily Wages
        </Link>
      )}
      <div className="attendance-manager-header-badge">
        <ShieldCheck size={13} />
        <span>Company Rules Active</span>
      </div>
    </div>
  </header>
  );
};
