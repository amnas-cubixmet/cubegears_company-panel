import React from 'react';
import { CalendarDays, ClipboardList, FileText, PieChart } from 'lucide-react';
import { HolidayCalendar } from '../my-attendance/HolidayCalendar';
import { HistoryLogs } from '../my-attendance/HistoryLogs';
import { LeaveRequests } from '../my-attendance/LeaveRequests';
import { AttendanceSummary } from '../my-attendance/AttendanceSummary';
import '../../styles/my-attendance-unified.css';

const sections = [
  { id: 'overview', label: 'Attendance', icon: CalendarDays },
  { id: 'history', label: 'History & Logs', icon: ClipboardList },
  { id: 'leave', label: 'Leave Requests', icon: FileText },
  { id: 'summary', label: 'Summary', icon: PieChart },
];

export const MyAttendance = () => {
  const scrollToSection = (id) => {
    document.getElementById(`attendance-${id}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="my-attendance-unified cg-attendance">
      <header className="my-attendance-unified-header">
        <div>
          <h1>My Attendance</h1>
          <p>Attendance, work logs, leave requests and monthly summary in one workspace.</p>
        </div>
      </header>

      <nav className="my-attendance-section-nav" aria-label="Attendance sections">
        {sections.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => scrollToSection(id)}>
            <Icon size={14} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="my-attendance-unified-content">
        <section id="attendance-overview" className="my-attendance-onepage-section">
          <div className="onepage-section-heading">
            <span>01</span>
            <div>
              <h2>Attendance Overview</h2>
              <p>Employee details, monthly attendance and daily records.</p>
            </div>
          </div>
          <HolidayCalendar />
        </section>

        <section id="attendance-history" className="my-attendance-onepage-section">
          <div className="onepage-section-heading">
            <span>02</span>
            <div>
              <h2>History & Logs</h2>
              <p>Detailed punch sessions, corrections and attendance records.</p>
            </div>
          </div>
          <HistoryLogs />
        </section>

        <section id="attendance-leave" className="my-attendance-onepage-section">
          <div className="onepage-section-heading">
            <span>03</span>
            <div>
              <h2>Leave Requests</h2>
              <p>Check leave balances and submit or review leave applications.</p>
            </div>
          </div>
          <LeaveRequests />
        </section>

        <section id="attendance-summary" className="my-attendance-onepage-section">
          <div className="onepage-section-heading">
            <span>04</span>
            <div>
              <h2>Monthly Summary</h2>
              <p>Attendance totals, worked hours, overtime and monthly flags.</p>
            </div>
          </div>
          <AttendanceSummary />
        </section>
      </div>
    </div>
  );
};
