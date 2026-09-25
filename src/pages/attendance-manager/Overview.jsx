import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, UserX, Clock3, CalendarDays, Activity } from 'lucide-react';
import { attendanceManagerService } from '../../services/attendanceManager.service';

export const AttendanceOverview = () => {
  const [team, setTeam] = useState([]);
  const [approvals, setApprovals] = useState([]);

  useEffect(() => {
    Promise.all([
      attendanceManagerService.getTeamAttendance(),
      attendanceManagerService.getApprovals()
    ]).then(([teamData, approvalData]) => {
      setTeam(teamData);
      setApprovals(approvalData);
    });
  }, []);

  const stats = useMemo(() => {
    const count = (status) => team.filter((item) => item.status === status).length;
    return {
      total: team.length,
      present: team.filter((item) => ['Present', 'Missing Clock Out'].includes(item.status)).length,
      absent: count('Absent'),
      late: team.filter((item) => Number(item.lateMinutes || 0) > 0).length,
      halfDay: count('Half Day'),
      leave: count('On Leave')
    };
  }, [team]);

  const productive = team.reduce((sum, item) => sum + Number(item.productiveHours || 0), 0);
  const idle = team.reduce((sum, item) => sum + Number(item.idleHours || 0), 0);
  const pending = approvals.filter((item) => item.status === 'Pending').length;

  const cards = [
    ['Total Staff', stats.total, Users],
    ['Present', stats.present, UserCheck],
    ['Absent', stats.absent, UserX],
    ['Late', stats.late, Clock3],
    ['Half Day', stats.halfDay, Activity],
    ['On Leave', stats.leave, CalendarDays]
  ];

  return (
    <div className="attendance-manager-module attendance-manager-overview flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {cards.map(([label, value, Icon]) => (
          <div key={label} className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-muted">{label}</span>
              <Icon size={16} className="text-primary" />
            </div>
            <div className="mt-2 text-2xl font-black text-content">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="text-sm font-extrabold text-content">Workshop Productivity</div>
          <div className="mt-1 text-xs text-muted">Job Card hours compared with attendance working hours.</div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface-2 p-4">
              <div className="text-[10px] font-bold uppercase tracking-wide text-muted">Productive Hours</div>
              <div className="mt-2 text-xl font-black text-primary">{productive.toFixed(1)}h</div>
            </div>
            <div className="rounded-xl bg-surface-2 p-4">
              <div className="text-[10px] font-bold uppercase tracking-wide text-muted">Idle Hours</div>
              <div className="mt-2 text-xl font-black text-content">{idle.toFixed(1)}h</div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {team.filter((item) => item.productiveHours > 0).slice(0, 5).map((item) => {
              const total = Number(item.productiveHours || 0) + Number(item.idleHours || 0);
              const pct = total ? Math.round((Number(item.productiveHours || 0) / total) * 100) : 0;
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="w-28 truncate text-[11px] font-semibold text-content">{item.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 text-right text-[10px] font-bold text-muted">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="text-sm font-extrabold text-content">Needs Attention</div>
          <div className="mt-1 text-xs text-muted">Attendance items that need manager review.</div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-line bg-surface-2 p-4">
              <div className="text-[10px] uppercase tracking-wide text-muted">Pending Requests</div>
              <div className="mt-2 text-xl font-black text-content">{pending}</div>
            </div>
            <div className="rounded-xl border border-line bg-surface-2 p-4">
              <div className="text-[10px] uppercase tracking-wide text-muted">Missing Punch</div>
              <div className="mt-2 text-xl font-black text-content">{team.filter((item) => item.missingPunch).length}</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/attendance-manager/daily" className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white no-underline">
              Open Daily Attendance
            </Link>
            <Link to="/attendance-manager/leave-requests" className="rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-bold text-content no-underline">
              Review Requests
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
