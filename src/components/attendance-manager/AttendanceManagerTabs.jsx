import React from 'react';
import {
  BarChart3,
  CalendarCheck2,
  CalendarDays,
  CalendarRange,
  ClipboardCheck,
  Clock3,
  LayoutDashboard,
  Settings,
  Timer,
} from 'lucide-react';

export const attendanceManagerTabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/attendance-manager/overview' },
  { id: 'daily', label: 'Daily', icon: ClipboardCheck, path: '/attendance-manager/daily' },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays, path: '/attendance-manager/calendar' },
  { id: 'leave-requests', label: 'Leave', icon: CalendarRange, path: '/attendance-manager/leave-requests' },
  { id: 'leave-types', label: 'Leave Types', icon: CalendarCheck2, path: '/attendance-manager/leave-types' },
  { id: 'overtime', label: 'Overtime', icon: Timer, path: '/attendance-manager/overtime' },
  { id: 'shifts', label: 'Shifts', icon: Clock3, path: '/attendance-manager/shifts' },
  { id: 'reports', label: 'Reports', icon: BarChart3, path: '/attendance-manager/reports' },
  { id: 'rules', label: 'Rules', icon: Settings, path: '/attendance-manager/rules' },
];

export const AttendanceManagerTabs = ({ activeTab, onNavigate }) => (
  <nav className="attendance-manager-dashboard-tabs" aria-label="Attendance Manager navigation">
    {attendanceManagerTabs.map(({ id, label, icon: Icon, path }) => (
      <button
        key={id}
        type="button"
        className={activeTab === id ? 'is-active' : ''}
        onClick={() => onNavigate(path)}
      >
        <Icon size={14} />
        <span>{label}</span>
      </button>
    ))}
  </nav>
);
