import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Search,
  UserRound,
} from 'lucide-react';
import { attendanceService } from '../../services/attendance.service';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/attendance-calendar.css';

const statusTone = (status = '') => {
  const value = String(status).toLowerCase();
  if (value.includes('present')) return 'present';
  if (value.includes('leave')) return 'leave';
  if (value.includes('holiday')) return 'holiday';
  if (value.includes('off')) return 'off';
  if (value.includes('missing')) return 'late';
  return 'neutral';
};

const minutesToHours = (minutes = 0) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${String(mins).padStart(2, '0')}m`;
};

export const HolidayCalendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1));
  const [events, setEvents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedDay, setSelectedDay] = useState(12);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      const [calendarEvents, attendanceLogs] = await Promise.all([
        attendanceService.getCalendarEvents(currentDate.getMonth() + 1, currentDate.getFullYear()),
        attendanceService.getPersonalAttendanceLogs(),
      ]);
      setEvents(calendarEvents || []);
      setLogs(attendanceLogs || []);
    };
    load();
  }, [currentDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const logByDay = useMemo(() => {
    const map = new Map();
    logs.forEach((log) => {
      const date = new Date(`${log.date}T00:00:00`);
      if (date.getFullYear() === year && date.getMonth() === month) {
        map.set(date.getDate(), log);
      }
    });
    return map;
  }, [logs, month, year]);

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
    if (!query) return logs;
    return logs.filter((log) =>
      [log.date, log.dayOfWeek, log.status, log.shiftName]
        .some((value) => String(value || '').toLowerCase().includes(query)),
    );
  }, [logs, search]);

  const presentDays = logs.filter((log) => log.status === 'Present').length;
  const totalWorkedMinutes = logs.reduce((sum, log) => sum + (log.totalWorkedMinutes || 0), 0);
  const lateCount = logs.filter((log) => (log.lateMinutes || 0) > 0 || log.status === 'Missing Clock Out').length;
  const averageMinutes = presentDays ? Math.round(totalWorkedMinutes / presentDays) : 0;

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const exportCsv = () => {
    const rows = [
      ['Date', 'Day', 'Status', 'Clock In', 'Clock Out', 'Worked'],
      ...logs.map((log) => [
        log.date,
        log.dayOfWeek,
        log.status,
        log.sessions?.[0]?.clockIn || '-',
        log.sessions?.[log.sessions.length - 1]?.clockOut || '-',
        minutesToHours(log.totalWorkedMinutes),
      ]),
    ];
    const csv = rows.map((row) => row.map((item) => `"${String(item).replaceAll('"', '""')}"`).join(',')).join('\n');
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
      <section className="attendance-hero-row">
        <div>
          <h2>Attendance Overview</h2>
          <p>Track your daily attendance, work hours and monthly activity.</p>
        </div>

        <div className="attendance-month-actions">
          <button type="button" onClick={handlePrevMonth} aria-label="Previous month"><ChevronLeft size={15} /></button>
          <div className="attendance-month-label"><CalendarDays size={14} /><span>{monthLabel}</span></div>
          <button type="button" onClick={handleNextMonth} aria-label="Next month"><ChevronRight size={15} /></button>
        </div>
      </section>

      <section className="employee-overview-card">
        <div className="employee-main">
          <div className="employee-avatar">
            {user?.avatar ? <img src={user.avatar} alt="" /> : <UserRound size={24} />}
          </div>
          <div className="employee-copy">
            <span className="eyebrow">Employee Details</span>
            <h3>{user?.name || 'Alex Rivera'}</h3>
            <p>{user?.role || 'Workshop Staff'}</p>
          </div>
        </div>

        <div className="employee-details-grid">
          <div><span>Employee ID</span><strong>CG-2026-001</strong></div>
          <div><span>Department</span><strong>Workshop Operations</strong></div>
          <div><span>Shift</span><strong>09:00 AM – 06:00 PM</strong></div>
          <div><span>Branch</span><strong>Main Garage</strong></div>
        </div>
      </section>

      <section className="attendance-kpi-grid-new">
        <article><span>Total Attendance</span><strong>{presentDays}</strong><small>present days</small></article>
        <article><span>Total Worked</span><strong>{minutesToHours(totalWorkedMinutes)}</strong><small>this period</small></article>
        <article><span>Late / Issues</span><strong>{lateCount}</strong><small>needs review</small></article>
        <article><span>Average Workday</span><strong>{minutesToHours(averageMinutes)}</strong><small>per present day</small></article>
      </section>

      <section className="attendance-strip-card">
        <div className="attendance-strip-header">
          <div>
            <h3>Attendance</h3>
            <p>{monthLabel}</p>
          </div>
          <div className="attendance-legend-new">
            <span><i className="dot present" />Present</span>
            <span><i className="dot late" />Late / Issue</span>
            <span><i className="dot leave" />Leave</span>
            <span><i className="dot holiday" />Holiday</span>
            <span><i className="dot off" />Weekly Off</span>
          </div>
        </div>

        <div className="attendance-days-scroll">
          <div className="attendance-days-row">
            {Array.from({ length: totalDays }, (_, index) => index + 1).map((day) => {
              const log = logByDay.get(day);
              const event = eventByDay.get(day);
              const tone = log ? statusTone(log.status) : event ? statusTone(event.type) : 'neutral';
              const selected = selectedDay === day;
              return (
                <button
                  key={day}
                  type="button"
                  className={`attendance-day-chip ${tone} ${selected ? 'selected' : ''}`}
                  onClick={() => setSelectedDay(day)}
                  title={log?.status || event?.title || 'No record'}
                >
                  <span>{String(day).padStart(2, '0')}</span>
                  <i />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="attendance-history-card-new">
        <div className="attendance-history-toolbar-new">
          <div>
            <h3>Attendance History</h3>
            <p>Daily shift and punch records</p>
          </div>

          <div className="attendance-history-actions">
            <label className="attendance-history-search">
              <Search size={13} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search attendance..." />
            </label>
            <button type="button" className="attendance-export-button" onClick={exportCsv}>
              <Download size={13} />
              Download Report
            </button>
          </div>
        </div>

        <div className="attendance-history-table-wrap">
          <table className="attendance-history-table-new">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Worked</th>
                <th>Shift</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const firstSession = log.sessions?.[0];
                const lastSession = log.sessions?.[log.sessions.length - 1];
                return (
                  <tr key={log.id}>
                    <td>
                      <strong>{log.dayOfWeek}</strong>
                      <span>{new Date(`${log.date}T00:00:00`).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </td>
                    <td><span className={`attendance-status-badge ${statusTone(log.status)}`}>{log.status}</span></td>
                    <td>{firstSession?.clockIn || '—'}</td>
                    <td>{lastSession?.clockOut || '—'}</td>
                    <td>{minutesToHours(log.totalWorkedMinutes)}</td>
                    <td>{log.shiftName || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
