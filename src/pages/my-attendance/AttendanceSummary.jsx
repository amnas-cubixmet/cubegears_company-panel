import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle2, AlertTriangle, FileText, AlertCircle, TrendingUp, Award, ShieldAlert } from 'lucide-react';
import { mockLeaveBalances } from '../../mock/leave.mock';

export const AttendanceSummary = () => {
  const navigate = useNavigate();
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  const months = ['September 2026', 'August 2026', 'July 2026'];

  const handlePrevMonth = () => {
    if (currentMonthIndex < months.length - 1) setCurrentMonthIndex(currentMonthIndex + 1);
  };

  const handleNextMonth = () => {
    if (currentMonthIndex > 0) setCurrentMonthIndex(currentMonthIndex - 1);
  };

  const handleCurrentMonth = () => {
    setCurrentMonthIndex(0);
  };

  const summaryMetrics = [
    { label: "Present Days", value: "22", icon: CheckCircle2, accent: "var(--success)" },
    { label: "Absent Days", value: "1", icon: AlertTriangle, accent: "var(--danger)" },
    { label: "Leave Days", value: "2", icon: FileText, accent: "var(--info)" },
    { label: "Holidays & Off", value: "5", icon: Calendar, accent: "var(--warning)" },
    { label: "Worked Hours", value: "176h 30m", icon: Clock, accent: "var(--info)" },
    { label: "Overtime Hours", value: "6h 15m", icon: TrendingUp, accent: "var(--primary)" },
    { label: "Late Days", value: "3", icon: AlertCircle, accent: "var(--warning)" },
    { label: "Available Leave", value: "25 Days", icon: Award, accent: "var(--success)" }
  ];

  const monthlyBreakdown = [
    { label: "Working Days", value: "26 Days", color: "var(--text-primary)" },
    { label: "Present", value: "22 Days", color: "var(--success)" },
    { label: "Absent", value: "1 Day", color: "var(--danger)" },
    { label: "Leave", value: "2 Days", color: "var(--primary)" },
    { label: "Holiday", value: "1 Day", color: "var(--warning)" },
    { label: "Weekly Off", value: "4 Days", color: "var(--text-muted)" }
  ];

  const attendanceFlags = [
    { label: "Missing Clock Out", count: "1 Record", route: "/my-attendance/history?status=Missing Clock Out", badgeColor: "var(--danger)" },
    { label: "Pending Punch Corrections", count: "1 Request", route: "/my-attendance/history?status=Missing Clock Out", badgeColor: "var(--warning)" }
  ];

  return (
    <div className="my-attendance-summary-page attendance-module attendance-summary-page" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* 2. Compact Month Selector Card */}
      <div className="month-selector-card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '10px 14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handlePrevMonth}
            disabled={currentMonthIndex === months.length - 1}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: currentMonthIndex === months.length - 1 ? 0.5 : 1
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            {months[currentMonthIndex]}
          </span>
          <button
            onClick={handleNextMonth}
            disabled={currentMonthIndex === 0}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: currentMonthIndex === 0 ? 0.5 : 1
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <button
          onClick={handleCurrentMonth}
          style={{
            padding: '5px 10px',
            borderRadius: '6px',
            backgroundColor: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Current Month
        </button>
      </div>

      {/* 3. Summary KPI Grid (2x2 Mobile / 4 Desktop) */}
      <div className="summary-kpi-grid">
        {summaryMetrics.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div
              key={idx}
              className="summary-kpi-card"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '88px',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--surface-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: item.accent,
                  flexShrink: 0
                }}>
                  <IconComp size={14} />
                </div>
              </div>

              <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
                {item.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Leave Balance Section */}
      <div className="attendance-section-block" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
          Leave Balance Breakdown
        </div>

        <div className="leave-balance-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', width: '100%' }}>
          {mockLeaveBalances.map((b) => (
            <div
              key={b.id}
              className="attendance-card leave-balance-summary-card"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {b.type}
              </div>

              {/* 2x2 Mini-Grid Inside Leave Type */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '8px',
                backgroundColor: 'var(--surface-2)',
                padding: '10px',
                borderRadius: '10px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Allocated</div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{b.allocated}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Used</div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{b.used}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pending</div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--warning)' }}>{b.pending}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Available</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--success)' }}>{b.available}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Monthly Breakdown Section */}
      <div className="attendance-card attendance-monthly-card" style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
          Monthly Day Distribution
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {monthlyBreakdown.map((row, i) => (
            <div
              key={i}
              className="attendance-data-row"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 10px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-2)',
                fontSize: '13px'
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
              <span style={{ fontWeight: '700', color: row.color }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Attendance Flags & Review Items Section */}
      <div className="attendance-card attendance-flags-card" style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
          Attendance Flags & Action Items
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {attendanceFlags.map((flag, idx) => (
            <div
              key={idx}
              className="attendance-data-row attendance-flag-row"
              onClick={() => navigate(flag.route)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{flag.label}</span>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: 'var(--surface-3)',
                color: flag.badgeColor
              }}>
                {flag.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

