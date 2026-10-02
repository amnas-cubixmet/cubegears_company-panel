import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, ClipboardList, FileText, PieChart } from 'lucide-react';
import { HolidayCalendar } from '../my-attendance/HolidayCalendar';
import { HistoryLogs } from '../my-attendance/HistoryLogs';
import { LeaveRequests } from '../my-attendance/LeaveRequests';
import { AttendanceSummary } from '../my-attendance/AttendanceSummary';
import '../../styles/my-attendance-pages.css';

const tabs = [
  { id: 'calendar', label: 'Attendance', icon: CalendarDays, path: '/my-attendance/calendar' },
  { id: 'history', label: 'History & Logs', icon: ClipboardList, path: '/my-attendance/history' },
  { id: 'leave', label: 'Leave Requests', icon: FileText, path: '/my-attendance/leave' },
  { id: 'summary', label: 'Summary', icon: PieChart, path: '/my-attendance/summary' },
];

export const MyAttendance = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab =
    tabs.find((tab) => location.pathname === tab.path)?.id || 'calendar';

  return (
    <div className="my-attendance-pages cg-attendance">
      <header className="my-attendance-pages-header">
        <div>
          <h1>My Attendance</h1>
          <p>View attendance, work logs, leave requests and monthly summary.</p>
        </div>
      </header>

      <nav className="my-attendance-pages-nav" aria-label="My Attendance navigation">
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

      <main className="my-attendance-pages-content">
        {activeTab === 'calendar' && <HolidayCalendar />}
        {activeTab === 'history' && <HistoryLogs />}
        {activeTab === 'leave' && <LeaveRequests />}
        {activeTab === 'summary' && <AttendanceSummary />}
      </main>
    </div>
  );
};
