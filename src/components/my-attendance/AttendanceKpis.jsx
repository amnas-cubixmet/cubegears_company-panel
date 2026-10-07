import React from 'react';
import { AlertTriangle, CalendarCheck2, Clock3, Gauge } from 'lucide-react';
import { minutesToHours } from './attendance.utils';

export const AttendanceKpis = ({ logs }) => {
  const rows = Array.isArray(logs) ? logs : [];
  const presentDays = rows.filter((log) => log.status === 'Present').length;
  const totalWorkedMinutes = rows.reduce((sum, log) => sum + Number(log.totalWorkedMinutes || 0), 0);
  const lateCount = rows.filter(
    (log) => Number(log.lateMinutes || 0) > 0 || log.status === 'Missing Clock Out',
  ).length;
  const averageMinutes = presentDays ? Math.round(totalWorkedMinutes / presentDays) : 0;

  const stats = [
    { label: 'Present Days', value: presentDays, meta: 'this period', icon: CalendarCheck2 },
    { label: 'Worked Hours', value: minutesToHours(totalWorkedMinutes), meta: 'total worked', icon: Clock3 },
    { label: 'Late / Issues', value: lateCount, meta: 'needs review', icon: AlertTriangle },
    { label: 'Average Workday', value: minutesToHours(averageMinutes), meta: 'per present day', icon: Gauge },
  ];

  return (
    <section className="attendance-dashboard-stats">
      {stats.map(({ label, value, meta, icon: Icon }) => (
        <article key={label}>
          <div className="attendance-stat-top">
            <span>{label}</span>
            <i><Icon size={15} /></i>
          </div>
          <strong>{value}</strong>
          <small>{meta}</small>
        </article>
      ))}
    </section>
  );
};
