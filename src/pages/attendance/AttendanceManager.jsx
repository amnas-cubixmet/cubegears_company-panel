import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardCheck,
  CalendarDays,
  CalendarRange,
  Timer,
  Clock3,
  BarChart3,
  Settings
} from 'lucide-react';
import { AttendanceOverview } from '../attendance-manager/Overview';
import { DailyAttendance } from '../attendance-manager/DailyAttendance';
import { MonthlyAttendanceCalendar } from '../attendance-manager/MonthlyCalendar';
import { LeaveRequestsManager } from '../attendance-manager/LeaveRequestsManager';
import { ShiftSettings } from '../attendance-manager/Shifts';
import { AttendanceReports } from '../attendance-manager/AttendanceReports';
import { RulesSettings } from '../attendance-manager/RulesSettings';
import { OvertimeManager } from '../../components/payroll/OvertimeManager';
import '../../styles/attendance-manager.css';
import '../../styles/attendance-manager-pages.css';

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/attendance-manager/overview' },
  { id: 'daily', label: 'Daily', icon: ClipboardCheck, path: '/attendance-manager/daily' },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays, path: '/attendance-manager/calendar' },
  { id: 'leave-requests', label: 'Leave', icon: CalendarRange, path: '/attendance-manager/leave-requests' },
  { id: 'overtime', label: 'Overtime', icon: Timer, path: '/attendance-manager/overtime' },
  { id: 'shifts', label: 'Shifts', icon: Clock3, path: '/attendance-manager/shifts' },
  { id: 'reports', label: 'Reports', icon: BarChart3, path: '/attendance-manager/reports' },
  { id: 'rules', label: 'Rules', icon: Settings, path: '/attendance-manager/rules' },
];

export const AttendanceManager = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab =
    tabs.find((tab) => location.pathname === tab.path)?.id || 'overview';

  return (
    <div className="attendance-manager-pages cg-attendance-manager">
      <header className="attendance-manager-pages-header">
        <div>
          <h1>Attendance Manager</h1>
          <p>Manage team attendance, leave, overtime, shifts, reports and rules.</p>
        </div>
      </header>

      <nav className="attendance-manager-pages-nav" aria-label="Attendance Manager navigation">
        {tabs.map(({ id, label, icon: Icon, path }) => (
          <button
            key={id}
            type="button"
            className={activeTab === id ? 'is-active' : ''}
            onClick={() => navigate(path)}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <main className="attendance-manager-pages-content">
        {activeTab === 'overview' && <AttendanceOverview />}
        {activeTab === 'daily' && <DailyAttendance />}
        {activeTab === 'calendar' && <MonthlyAttendanceCalendar />}
        {activeTab === 'leave-requests' && <LeaveRequestsManager />}
        {activeTab === 'overtime' && (
          <div className="attendance-manager-overtime-shell">
            <OvertimeManager />
          </div>
        )}
        {activeTab === 'shifts' && <ShiftSettings />}
        {activeTab === 'reports' && <AttendanceReports />}
        {activeTab === 'rules' && <RulesSettings />}
      </main>
    </div>
  );
};
