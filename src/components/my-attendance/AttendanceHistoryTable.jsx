import React from 'react';
import { Download, Search } from 'lucide-react';
import { formatAttendanceTime, minutesToHours, statusTone } from './attendance.utils';

export const AttendanceHistoryTable = ({
  logs,
  search,
  onSearchChange,
  onExport,
}) => (
  <section className="attendance-dashboard-card attendance-history-card">
    <header className="attendance-card-header attendance-history-header">
      <div>
        <h3>Attendance History</h3>
        <p>Daily shift and punch records</p>
      </div>

      <div className="attendance-history-actions">
        <label className="attendance-history-search">
          <Search size={13} />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search attendance..."
          />
        </label>

        <button type="button" className="attendance-export-button" onClick={onExport}>
          <Download size={13} />
          Export
        </button>
      </div>
    </header>

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
          {logs.map((log) => (
            <tr key={log.id}>
              <td>
                <strong>{log.dayOfWeek}</strong>
                <span>{new Date(`${log.date}T00:00:00`).toLocaleDateString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}</span>
              </td>
              <td>
                <span className={`attendance-status-badge ${statusTone(log.status)}`}>
                  {log.status}
                </span>
              </td>
              <td>{formatAttendanceTime(log.sessions?.[0]?.clockIn)}</td>
              <td>{formatAttendanceTime(log.sessions?.[log.sessions.length - 1]?.clockOut)}</td>
              <td>{minutesToHours(log.totalWorkedMinutes)}</td>
              <td>{log.shiftName || 'General Shift'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {!logs.length && <div className="attendance-empty-state">No attendance records found.</div>}
  </section>
);
