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
  P: 'bg-emerald-50 text-emerald-700',
  A: 'bg-red-50 text-red-700',
  L: 'bg-blue-50 text-blue-700',
  H: 'bg-amber-50 text-amber-700',
  WO: 'bg-surface-2 text-muted'
};

export const MonthlyAttendanceCalendar = () => {
  const [month] = useState('September 2026');
  const days = useMemo(() => Array.from({ length: 30 }, (_, index) => index + 1), []);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="text-base font-extrabold text-content">Monthly Attendance Calendar</div>
        <div className="mt-1 text-xs text-muted">{month} · P Present · A Absent · L Leave · H Half Day · WO Weekly Off</div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <div className="min-w-[1050px] p-3">
          <div className="grid grid-cols-[170px_repeat(30,28px)] gap-1">
            <div className="sticky left-0 z-10 bg-surface px-2 py-2 text-[10px] font-bold uppercase text-muted">Employee</div>
            {days.map((day) => <div key={day} className="py-2 text-center text-[9px] font-bold text-muted">{day}</div>)}

            {mockTeamAttendance.map((staff) => (
              <React.Fragment key={staff.id}>
                <div className="sticky left-0 z-10 flex min-h-8 items-center bg-surface px-2 text-[11px] font-semibold text-content">{staff.name}</div>
                {days.map((day) => {
                  const status = statusForDay(staff, day);
                  return (
                    <div key={day} title={`${staff.name} · ${day} Sep · ${status}`} className={['grid size-7 place-items-center rounded-md text-[9px] font-bold', tone[status]].join(' ')}>
                      {status}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
