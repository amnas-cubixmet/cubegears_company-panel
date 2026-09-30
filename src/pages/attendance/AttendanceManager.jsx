import React from 'react';
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
import '../../styles/attendance-manager-unified.css';

const sections = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'daily', label: 'Daily', icon: ClipboardCheck },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'leave-requests', label: 'Leave', icon: CalendarRange },
  { id: 'overtime', label: 'Overtime', icon: Timer },
  { id: 'shifts', label: 'Shifts', icon: Clock3 },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'rules', label: 'Rules', icon: Settings },
];

export const AttendanceManager = () => {
  const scrollToSection = (id) => {
    document.getElementById(`attendance-manager-${id}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="attendance-manager-unified">
      <header className="attendance-manager-unified-header">
        <div>
          <h1>Attendance Manager</h1>
          <p>Manage team attendance, leave, overtime, shifts, reports and rules from one workspace.</p>
        </div>
      </header>

      <nav className="attendance-manager-section-nav" aria-label="Attendance Manager sections">
        {sections.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => scrollToSection(id)}>
            <Icon size={14} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="attendance-manager-unified-content">
        <section id="attendance-manager-overview" className="attendance-manager-onepage-section">
          <div className="attendance-manager-section-heading">
            <span>01</span>
            <div>
              <h2>Overview</h2>
              <p>Team attendance health, exceptions and quick actions.</p>
            </div>
          </div>
          <AttendanceOverview />
        </section>

        <section id="attendance-manager-daily" className="attendance-manager-onepage-section">
          <div className="attendance-manager-section-heading">
            <span>02</span>
            <div>
              <h2>Daily Attendance</h2>
              <p>Review staff punches, present/absent status and daily exceptions.</p>
            </div>
          </div>
          <DailyAttendance />
        </section>

        <section id="attendance-manager-calendar" className="attendance-manager-onepage-section">
          <div className="attendance-manager-section-heading">
            <span>03</span>
            <div>
              <h2>Monthly Calendar</h2>
              <p>Monthly staff attendance and holiday visibility.</p>
            </div>
          </div>
          <MonthlyAttendanceCalendar />
        </section>

        <section id="attendance-manager-leave-requests" className="attendance-manager-onepage-section">
          <div className="attendance-manager-section-heading">
            <span>04</span>
            <div>
              <h2>Leave Requests</h2>
              <p>Review, approve and track staff leave requests.</p>
            </div>
          </div>
          <LeaveRequestsManager />
        </section>

        <section id="attendance-manager-overtime" className="attendance-manager-onepage-section">
          <div className="attendance-manager-section-heading">
            <span>05</span>
            <div>
              <h2>Overtime</h2>
              <p>Track overtime hours and approval status.</p>
            </div>
          </div>
          <div className="attendance-manager-overtime-shell">
            <OvertimeManager />
          </div>
        </section>

        <section id="attendance-manager-shifts" className="attendance-manager-onepage-section">
          <div className="attendance-manager-section-heading">
            <span>06</span>
            <div>
              <h2>Shifts</h2>
              <p>Manage work shifts and staff scheduling rules.</p>
            </div>
          </div>
          <ShiftSettings />
        </section>

        <section id="attendance-manager-reports" className="attendance-manager-onepage-section">
          <div className="attendance-manager-section-heading">
            <span>07</span>
            <div>
              <h2>Reports</h2>
              <p>Attendance summaries and payroll-ready reporting.</p>
            </div>
          </div>
          <AttendanceReports />
        </section>

        <section id="attendance-manager-rules" className="attendance-manager-onepage-section">
          <div className="attendance-manager-section-heading">
            <span>08</span>
            <div>
              <h2>Rules & Settings</h2>
              <p>Configure attendance policies, grace periods and rules.</p>
            </div>
          </div>
          <RulesSettings />
        </section>
      </div>
    </div>
  );
};
