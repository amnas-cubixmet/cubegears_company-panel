import React, { useMemo, useState } from 'react';
import { mockTeamAttendance } from '../../mock/attendanceManager.mock';

const statusForDay = (staff, day) => {
  const date = new Date(2026, 8, day);
  if (date.getDay() === 0) return 'WO';
  if (day === 25) {
    if (staff.status === 'Present' || staff.status === 'Missing Clock Out') return 'P';
    if (staff.status === 'Absent') return 'A';
    if (staff.status === 'Half Day') return 'H';
    if (staff.status === 'On Leave') return 'L';
  }
  if ((day + Number(staff.staffId.slice(-1))) % 17 === 0) return 'L';
  if ((day + Number(staff.staffId.slice(-1))) % 19 === 0) return 'A';
  return 'P';
};

const tone = {
  P: 'am-day--present',
  A: 'am-day--absent',
  L: 'am-day--leave',
  H: 'am-day--half',
  WO: 'am-day--off'
};

export const MonthlyAttendanceCalendar = () => {
  const [month] = useState('September 2026');
  const days = useMemo(() => Array.from({ length: 30 }, (_, index) => index + 1), []);
  const blocks = [days.slice(0, 15), days.slice(15)];

  return (
    <div className="attendance-manager-module attendance-manager-calendar">
      <section className="am-calendar-header">
        <div>
          <h2>Monthly Attendance Calendar</h2>
          <p>{month}</p>
        </div>
        <div className="am-calendar-legend">
          <span><i className="am-day am-day--present">P</i> Present</span>
          <span><i className="am-day am-day--absent">A</i> Absent</span>
          <span><i className="am-day am-day--leave">L</i> Leave</span>
          <span><i className="am-day am-day--half">H</i> Half Day</span>
          <span><i className="am-day am-day--off">WO</i> Weekly Off</span>
        </div>
      </section>

      <div className="am-calendar-blocks">
        {blocks.map((blockDays, blockIndex) => (
          <section key={blockIndex} className="am-calendar-block">
            <div className="am-calendar-block__title">
              Days {blockDays[0]}–{blockDays[blockDays.length - 1]}
            </div>
            <div className="am-calendar-scroll">
              <div className="am-calendar-grid" style={{ '--am-days': blockDays.length }}>
                <div className="am-calendar-employee-head">Employee</div>
                {blockDays.map((day) => <div key={day} className="am-calendar-day-head">{day}</div>)}

                {mockTeamAttendance.map((staff) => (
                  <React.Fragment key={staff.id}>
                    <div className="am-calendar-employee">{staff.name}</div>
                    {blockDays.map((day) => {
                      const status = statusForDay(staff, day);
                      return (
                        <div
                          key={day}
                          title={`${staff.name} · ${day} Sep · ${status}`}
                          className={`am-day ${tone[status]}`}
                        >
                          {status}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
