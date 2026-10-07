import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MyAttendanceHeader, MyAttendanceTabs } from '../../components/my-attendance';
import { HolidayCalendar } from '../my-attendance/HolidayCalendar';
import { HistoryLogs } from '../my-attendance/HistoryLogs';
import { LeaveRequests } from '../my-attendance/LeaveRequests';
import { AttendanceSummary } from '../my-attendance/AttendanceSummary';
import '../../styles/my-attendance-pages.css';

export const MyAttendance = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = location.pathname.includes('/history')
    ? 'history'
    : location.pathname.includes('/leave')
      ? 'leave'
      : location.pathname.includes('/summary')
        ? 'summary'
        : 'calendar';

  return (
    <div className="my-attendance-pages cg-attendance">
      <MyAttendanceHeader />
      <MyAttendanceTabs activeTab={activeTab} onNavigate={navigate} />

      <main className="my-attendance-pages-content">
        {activeTab === 'calendar' && <HolidayCalendar />}
        {activeTab === 'history' && <HistoryLogs />}
        {activeTab === 'leave' && <LeaveRequests />}
        {activeTab === 'summary' && <AttendanceSummary />}
      </main>
    </div>
  );
};
