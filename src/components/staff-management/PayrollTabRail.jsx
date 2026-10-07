import React, { useEffect, useRef } from 'react';
import {
  BarChart3,
  Banknote,
  CalendarCheck2,
  Clock3,
  FileText,
  LayoutDashboard,
  Play,
  ReceiptText,
  Settings2,
  Users,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const tabs = [
  { label: 'Overview', path: '/payroll', icon: LayoutDashboard },
  { label: 'Employees', path: '/payroll/employees', icon: Users },
  { label: 'Attendance', path: '/payroll/attendance', icon: CalendarCheck2 },
  { label: 'Salary Setup', path: '/payroll/salary-setup', icon: Settings2 },
  { label: 'Incentives', path: '/payroll/incentives', icon: BarChart3 },
  { label: 'Overtime', path: '/payroll/overtime', icon: Clock3 },
  { label: 'Advances', path: '/payroll/advances', icon: Banknote },
  { label: 'Run Payroll', path: '/payroll/run', icon: Play },
  { label: 'Payslips', path: '/payroll/payslips', icon: ReceiptText },
  { label: 'Reports', path: '/payroll/reports', icon: FileText },
];

export const PayrollTabRail = () => {
  const railRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      railRef.current?.querySelector('.payroll-subnav-item.active')?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }, 60);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <nav className="payroll-tabs-shell" aria-label="Payroll navigation">
      <div ref={railRef} className="payroll-subnav">
        {tabs.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/payroll'}
            className={({ isActive }) =>
              `payroll-subnav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={13} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
