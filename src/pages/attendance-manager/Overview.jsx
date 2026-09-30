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
    <div className="attendance-manager-module attendance-manager-overview">
      <div className="am-stat-grid">
        {cards.map(([label, value, Icon]) => (
          <article key={label} className="am-stat-card">
            <div className="am-stat-card__top">
              <span>{label}</span>
              <span className="am-stat-card__icon"><Icon size={16} /></span>
            </div>
            <strong className="am-stat-card__value">{value}</strong>
          </article>
        ))}
      </div>

      <div className="am-overview-grid">
        <section className="am-panel">
          <div className="am-panel__header">
            <div>
              <h2>Workshop Productivity</h2>
              <p>Job Card hours compared with attendance working hours.</p>
            </div>
          </div>

          <div className="am-mini-metrics">
            <div className="am-mini-metric">
              <span>Productive Hours</span>
              <strong>{productive.toFixed(1)}h</strong>
            </div>
            <div className="am-mini-metric">
              <span>Idle Hours</span>
              <strong>{idle.toFixed(1)}h</strong>
            </div>
          </div>

          <div className="am-productivity-list">
            {team.filter((item) => item.productiveHours > 0).slice(0, 5).map((item) => {
              const total = Number(item.productiveHours || 0) + Number(item.idleHours || 0);
              const pct = total ? Math.round((Number(item.productiveHours || 0) / total) * 100) : 0;
              return (
                <div key={item.id} className="am-productivity-row">
                  <span className="am-productivity-name">{item.name}</span>
                  <div className="am-progress-track">
                    <span className="am-progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <strong>{pct}%</strong>
                </div>
              );
            })}
          </div>
        </section>

        <section className="am-panel">
          <div className="am-panel__header">
            <div>
              <h2>Needs Attention</h2>
              <p>Attendance items that need manager review.</p>
            </div>
          </div>

          <div className="am-mini-metrics">
            <div className="am-mini-metric">
              <span>Pending Requests</span>
              <strong>{pending}</strong>
            </div>
            <div className="am-mini-metric">
              <span>Missing Punch</span>
              <strong>{team.filter((item) => item.missingPunch).length}</strong>
            </div>
          </div>

          <div className="am-action-grid">
            <Link to="/attendance-manager/daily" className="am-action-button am-action-button--primary">
              Open Daily Attendance
            </Link>
            <Link to="/attendance-manager/leave-requests" className="am-action-button">
              Review Requests
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
