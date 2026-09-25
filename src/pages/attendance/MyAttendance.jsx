import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, History, FileText, PieChart } from 'lucide-react';
import { MobileTabRail } from '../../components/common/MobileTabRail';
import { HolidayCalendar } from '../my-attendance/HolidayCalendar';
import { HistoryLogs } from '../my-attendance/HistoryLogs';
import { LeaveRequests } from '../my-attendance/LeaveRequests';
import { AttendanceSummary } from '../my-attendance/AttendanceSummary';

const tabs = [
  { id: 'calendar', label: 'Holiday Calendar', icon: Calendar },
  { id: 'history', label: 'History & Logs', icon: History },
  { id: 'leave', label: 'Leave Requests', icon: FileText },
  { id: 'summary', label: 'Summary', icon: PieChart }
];

export const MyAttendance = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialTab = () => {
    if (location.pathname.includes('/calendar')) return 'calendar';
    if (location.pathname.includes('/leave')) return 'leave';
    if (location.pathname.includes('/summary')) return 'summary';
    return 'history';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/my-attendance/${tabId}`);
  };

  return (
    <div className="my-attendance-page cg-attendance flex w-full min-w-0 flex-col gap-4">
      <header className="attendance-page-header">
        <h1 className="m-0 text-[22px] font-extrabold leading-tight text-content">
          My Attendance
        </h1>
        <p className="mt-1 text-[13px] leading-5 text-muted">
          View personal attendance history, shift logs, leave applications and workshop holidays.
        </p>
      </header>

      <MobileTabRail
        className="my-attendance-tabs"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div className="attendance-tab-content w-full min-w-0">
        {activeTab === 'calendar' && <HolidayCalendar />}
        {activeTab === 'history' && <HistoryLogs />}
        {activeTab === 'leave' && <LeaveRequests />}
        {activeTab === 'summary' && <AttendanceSummary />}
      </div>
    </div>
  );
};
