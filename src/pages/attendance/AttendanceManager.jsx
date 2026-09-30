import React, { useEffect, useState } from 'react';
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
import { MobileTabRail } from '../../components/common/MobileTabRail';
import { AttendanceOverview } from '../attendance-manager/Overview';
import { DailyAttendance } from '../attendance-manager/DailyAttendance';
import { MonthlyAttendanceCalendar } from '../attendance-manager/MonthlyCalendar';
import { LeaveRequestsManager } from '../attendance-manager/LeaveRequestsManager';
import { ShiftSettings } from '../attendance-manager/Shifts';
import { AttendanceReports } from '../attendance-manager/AttendanceReports';
import { RulesSettings } from '../attendance-manager/RulesSettings';
import { OvertimeManager } from '../../components/payroll/OvertimeManager';

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'daily', label: 'Daily Attendance', mobileLabel: 'Daily', icon: ClipboardCheck },
  { id: 'calendar', label: 'Monthly Calendar', mobileLabel: 'Calendar', icon: CalendarDays },
  { id: 'leave-requests', label: 'Leave Requests', mobileLabel: 'Leave', icon: CalendarRange },
  { id: 'overtime', label: 'Overtime', mobileLabel: 'OT', icon: Timer },
  { id: 'shifts', label: 'Shifts', icon: Clock3 },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'rules', label: 'Rules & Settings', mobileLabel: 'Rules', icon: Settings }
];

export const AttendanceManager = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = () => {
    const matched = tabs.find((tab) => location.pathname === `/attendance-manager/${tab.id}`);
    return matched?.id || 'overview';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(tabId === 'overview' ? '/attendance-manager/overview' : `/attendance-manager/${tabId}`);
  };

  return (
    <div className="attendance-manager-page cg-attendance-manager flex w-full min-w-0 flex-col gap-4">
      <div className="attendance-manager-header">
        <h1 className="m-0 text-[22px] font-extrabold leading-tight text-content">Attendance Manager</h1>
        <p className="mt-1 text-[13px] leading-5 text-muted">
          Manage daily attendance, leave, overtime, shifts, productivity and payroll-ready attendance records.
        </p>
      </div>

      <div className="attendance-manager-desktop-tabs hidden w-full md:block">
        <div className="attendance-manager-tabs flex gap-1.5 overflow-x-auto rounded-2xl border border-line bg-surface p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={[
                  'inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-semibold transition',
                  active
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-transparent text-secondary hover:bg-surface-2 hover:text-content'
                ].join(' ')}
              >
                <Icon size={15}/>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="attendance-manager-mobile-tabs w-full md:hidden">
        <MobileTabRail
          className="attendance-manager-tabs"
          tabs={tabs.map((tab) => ({
            id: tab.id,
            label: tab.mobileLabel || tab.label,
            icon: tab.icon
          }))}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      <div className="attendance-manager-content w-full min-w-0">
        {activeTab === 'overview' && <AttendanceOverview />}
        {activeTab === 'daily' && <DailyAttendance />}
        {activeTab === 'calendar' && <MonthlyAttendanceCalendar />}
        {activeTab === 'leave-requests' && <LeaveRequestsManager />}
        {activeTab === 'overtime' && (
          <div className="attendance-manager-overtime rounded-2xl border border-line bg-surface-2 p-3 sm:p-4">
            <OvertimeManager />
          </div>
        )}
        {activeTab === 'shifts' && <ShiftSettings />}
        {activeTab === 'reports' && <AttendanceReports />}
        {activeTab === 'rules' && <RulesSettings />}
      </div>
    </div>
  );
};
