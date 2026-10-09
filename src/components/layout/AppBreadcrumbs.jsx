import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { staffService } from '../../services/staff.service';
import '../../styles/breadcrumbs.css';

const LABELS = {
  dashboard: 'Dashboard',
  customers: 'Customers',
  vehicles: 'Vehicles',
  services: 'Services',
  jobs: 'Job Cards',
  inventory: 'Inventory',
  stock: 'Stock Management',
  invoices: 'Invoices & Billing',
  'e-way-bills': 'E-Way Bills',
  payments: 'Payments',
  expenses: 'Expenses',
  reports: 'Reports & BI',
  notifications: 'Notifications',
  settings: 'Settings',
  profile: 'Profile',
  account: 'Account',
  billing: 'Billing & Plan',
  storage: 'Media Storage',
  history: 'History',
  'my-attendance': 'My Attendance',
  calendar: 'Holiday Calendar',
  leave: 'Leave Requests',
  summary: 'Summary',
  'attendance-manager': 'Attendance Manager',
  overview: 'Overview',
  daily: 'Daily Attendance',
  approvals: 'Approvals',
  'team-review': 'Team Review',
  'master-records': 'Master Records',
  'leave-types': 'Leave Types',
  'leave-requests': 'Leave Requests',
  holidays: 'Holidays',
  overtime: 'Overtime',
  shifts: 'Shifts',
  rules: 'Rules & Settings',
  'staff-management': 'Staff Management',
  staff: 'Staff',
  roles: 'Roles & Permissions',
  teams: 'Teams',
  skills: 'Skills',
  performance: 'Performance',
  documents: 'Documents',
  payroll: 'Payroll',
  employees: 'Employees',
  attendance: 'Attendance',
  'salary-setup': 'Salary Setup',
  'daily-wages': 'Daily Wages',
  wages: 'Wage Account',
  incentives: 'Incentives',
  run: 'Run Payroll',
  'salary-structure': 'Salary Structure',
  monthly: 'Monthly Payroll',
  disbursal: 'Disbursal',
  advances: 'Advances',
  payslips: 'Payslips',
  new: 'New',
  edit: 'Edit',
  delete: 'Delete',
  complaints: 'Complaints',
  inspection: 'Inspection',
  parts: 'Parts',
  estimate: 'Estimate',
  updates: 'Technician Updates',
  qc: 'QC',
  invoice: 'Invoice',
  activity: 'Activity',
  costs: 'Costs',
  work: 'Work & Labour',
  photos: 'Photos'
};

const prettify = (value) => {
  if (!value) return '';
  if (LABELS[value]) return LABELS[value];
  if (/^[A-Z]{2,}-/i.test(value) || /^\d+$/.test(value)) return decodeURIComponent(value);
  return decodeURIComponent(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const buildHref = (segments, index) => '/' + segments.slice(0, index + 1).join('/');

export function AppBreadcrumbs() {
  const location = useLocation();
  const scrollRef = useRef(null);
  const [staffBreadcrumbLabel, setStaffBreadcrumbLabel] = useState('');

  useEffect(() => {
    let alive = true;
    const match = location.pathname.match(/^\/staff-management\/staff\/([^/]+)$/)
      || location.pathname.match(/^\/staff\/([^/]+)\/wages$/);

    if (!match) {
      setStaffBreadcrumbLabel('');
      return () => {
        alive = false;
      };
    }

    setStaffBreadcrumbLabel('Staff Profile');

    staffService
      .getStaffById(decodeURIComponent(match[1]))
      .then((profile) => {
        if (alive && profile) {
          setStaffBreadcrumbLabel(profile.name || 'Staff Profile');
        }
      })
      .catch(() => {
        if (alive) setStaffBreadcrumbLabel('Staff Profile');
      });

    return () => {
      alive = false;
    };
  }, [location.pathname]);

  const items = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (!segments.length || location.pathname === '/dashboard') return [];

    const isStaffProfile =
      segments.length === 3 &&
      segments[0] === 'staff-management' &&
      segments[1] === 'staff';

    if (segments.length === 3 && segments[0] === 'staff' && segments[2] === 'wages') {
      return [
        { label: 'Home', href: '/dashboard', current: false, home: true },
        { label: 'Staff Management', href: '/staff-management/staff', current: false },
        { label: staffBreadcrumbLabel || 'Staff Profile', href: `/staff-management/staff/${segments[1]}`, current: false },
        { label: 'Wage Account', href: location.pathname, current: true },
      ];
    }

    return [
      { label: 'Home', href: '/dashboard', current: false, home: true },
      ...segments.map((segment, index) => ({
        label:
          isStaffProfile && index === 2
            ? staffBreadcrumbLabel || 'Staff Profile'
            : prettify(segment),
        href: buildHref(segments, index),
        current: index === segments.length - 1
      }))
    ];
  }, [location.pathname, staffBreadcrumbLabel]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }, [location.pathname]);

  if (!items.length) return null;

  return (
    <nav className="app-breadcrumb-wrap no-print" aria-label="Breadcrumb">
      <div className="app-breadcrumb" ref={scrollRef}>
        {items.map((item, index) => (
          <React.Fragment key={item.href + item.label}>
            {index > 0 && (
              <span className="app-breadcrumb-separator" aria-hidden="true">
                <ChevronRight size={12} />
              </span>
            )}
            {item.current ? (
              <span className="app-breadcrumb-current" aria-current="page">{item.label}</span>
            ) : (
              <Link className="app-breadcrumb-link" to={item.href}>
                {item.home && <Home size={12} />}
                <span>{item.label}</span>
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
}

export default AppBreadcrumbs;
