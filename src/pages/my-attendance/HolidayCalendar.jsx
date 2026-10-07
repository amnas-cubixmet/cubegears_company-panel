import React, { useEffect, useMemo, useState } from 'react';
import {
  AttendanceHistoryTable,
  AttendanceKpis,
  AttendanceMonthStrip,
  AttendanceOverviewHeader,
  AttendancePunchPanel,
  EmployeeAttendanceCard,
} from '../../components/my-attendance';
import { minutesToHours } from '../../components/my-attendance/attendance.utils';
import { attendanceService } from '../../services/attendance.service';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/attendance-calendar.css';

export const HolidayCalendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [events, setEvents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const [calendarEvents, attendanceLogs] = await Promise.all([
        attendanceService.getCalendarEvents(month, year),
        attendanceService.getPersonalAttendanceLogs(),
      ]);

      if (!active) return;
      setEvents(Array.isArray(calendarEvents) ? calendarEvents : []);
      setLogs(Array.isArray(attendanceLogs) ? attendanceLogs : []);
    };

    load();
    return () => {
      active = false;
    };
  }, [currentDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const monthLabel = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const monthLogs = useMemo(
    () =>
      logs.filter((log) => {
        const date = new Date(`${log.date}T00:00:00`);
        return date.getFullYear() === year && date.getMonth() === month;
      }),
    [logs, month, year],
  );

  const logByDay = useMemo(() => {
    const map = new Map();
    monthLogs.forEach((log) => {
      const date = new Date(`${log.date}T00:00:00`);
      map.set(date.getDate(), log);
    });
    return map;
  }, [monthLogs]);

  const eventByDay = useMemo(() => {
    const map = new Map();
    events.forEach((event) => {
      const date = new Date(`${event.date}T00:00:00`);
      if (date.getFullYear() === year && date.getMonth() === month) {
        map.set(date.getDate(), event);
      }
    });
    return map;
  }, [events, month, year]);

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return monthLogs;

    return monthLogs.filter((log) =>
      [log.date, log.dayOfWeek, log.status, log.shiftName]
        .some((value) => String(value || '').toLowerCase().includes(query)),
    );
  }, [monthLogs, search]);

  const exportCsv = () => {
    const rows = [
      ['Date', 'Day', 'Status', 'Clock In', 'Clock Out', 'Worked'],
      ...monthLogs.map((log) => [
        log.date,
        log.dayOfWeek,
        log.status,
        log.sessions?.[0]?.clockIn || '-',
        log.sessions?.[log.sessions.length - 1]?.clockOut || '-',
        minutesToHours(log.totalWorkedMinutes),
      ]),
    ];

    const csv = rows
      .map((row) => row.map((item) => `"${String(item ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `attendance-${year}-${String(month + 1).padStart(2, '0')}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="attendance-calendar-redesign">
      <AttendanceOverviewHeader
        monthLabel={monthLabel}
        onPreviousMonth={() => setCurrentDate(new Date(year, month - 1, 1))}
        onNextMonth={() => setCurrentDate(new Date(year, month + 1, 1))}
      />

      <EmployeeAttendanceCard user={user} />
      <AttendancePunchPanel
        onChanged={() =>
          setCurrentDate((value) =>
            new Date(value.getFullYear(), value.getMonth(), value.getDate())
          )
        }
      />
      <AttendanceKpis logs={monthLogs} />

      <AttendanceMonthStrip
        monthLabel={monthLabel}
        totalDays={totalDays}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        logByDay={logByDay}
        eventByDay={eventByDay}
      />

      <AttendanceHistoryTable
        logs={filteredLogs}
        search={search}
        onSearchChange={setSearch}
        onExport={exportCsv}
      />
    </div>
  );
};
