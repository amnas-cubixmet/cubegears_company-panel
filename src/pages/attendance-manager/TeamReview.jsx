import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { attendanceManagerService } from '../../services/attendanceManager.service';
import { ResponsiveModalSheet } from '../../components/common/ResponsiveModalSheet';

export const TeamReview = () => {
  const navigate = useNavigate();
  const [teamList, setTeamList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedStaff, setSelectedStaff] = useState(null);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const data = await attendanceManagerService.getTeamAttendance();
      setTeamList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = statusFilter === 'All'
    ? teamList
    : teamList.filter(t => t.status === statusFilter);

  const kpis = [
    { label: "Scheduled Today", value: "24", accent: "var(--text-primary)" },
    { label: "Present", value: "19", accent: "var(--success)" },
    { label: "Absent", value: "2", accent: "var(--danger)" },
    { label: "On Leave", value: "3", accent: "var(--primary)" },
    { label: "Late (Subset)", value: "4", accent: "var(--warning)" },
    { label: "Missing Punch", value: "1", accent: "var(--danger)" }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* 2x2 Summary Cards Grid (consistent employee totals) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', width: '100%' }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '72px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>{k.label}</span>
            <div style={{ fontSize: '20px', fontWeight: '800', color: k.accent, marginTop: '2px' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Pill Filter Row */}
      <div className="attendance-filter-scroll scroll-hidden">
        {['All', 'Present', 'Absent', 'On Leave', 'Missing Clock Out'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            style={{
              height: '36px',
              padding: '0 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: statusFilter === st ? '700' : '500',
              backgroundColor: statusFilter === st ? 'var(--primary)' : 'var(--surface-2)',
              color: statusFilter === st ? '#ffffff' : 'var(--text-secondary)',
              border: statusFilter === st ? '1px solid var(--primary)' : '1px solid var(--border)',
              cursor: 'pointer'
            }}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Mobile Staff Cards List */}
      <div className="mobile-card-view" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
        {filtered.map((staff) => (
          <div
            key={staff.id}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={staff.avatar} alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{staff.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{staff.designation} • {staff.branch}</div>
                </div>
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: staff.status === 'Present' ? 'var(--success-soft)' : (staff.status === 'On Leave' ? 'var(--primary-soft)' : 'var(--danger-soft)'),
                color: staff.status === 'Present' ? 'var(--success)' : (staff.status === 'On Leave' ? 'var(--primary)' : 'var(--danger)')
              }}>
                {staff.status.toUpperCase()}
              </span>
            </div>

            <div style={{ backgroundColor: 'var(--surface-2)', borderRadius: '10px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
              <div><strong style={{ color: 'var(--text-primary)' }}>Shift:</strong> {staff.shift}</div>
              <div><strong style={{ color: 'var(--text-primary)' }}>Clock In:</strong> {staff.clockIn || '—'} | <strong style={{ color: 'var(--text-primary)' }}>Out:</strong> {staff.clockOut || '—'}</div>
              <div><strong style={{ color: 'var(--text-primary)' }}>Worked:</strong> {staff.worked} {staff.lateMinutes > 0 ? <span style={{ color: 'var(--warning)', marginLeft: '6px' }}>(Late {staff.lateMinutes}m)</span> : ''}</div>
            </div>

            <button
              onClick={() => navigate(`/attendance-manager/team-review/${staff.staffId || staff.id || 'EMP-0012'}/${new Date().toISOString().split('T')[0]}`)}
              style={{
                width: '100%',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Eye size={14} /> View Details
            </button>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="desktop-table-view" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px 16px' }}>Staff</th>
              <th style={{ padding: '12px 16px' }}>Branch</th>
              <th style={{ padding: '12px 16px' }}>Shift</th>
              <th style={{ padding: '12px 16px' }}>Clock In / Out</th>
              <th style={{ padding: '12px 16px' }}>Worked</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 16px', fontWeight: '600' }}>{s.name} <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.designation}</div></td>
                <td style={{ padding: '14px 16px' }}>{s.branch}</td>
                <td style={{ padding: '14px 16px' }}>{s.shift}</td>
                <td style={{ padding: '14px 16px' }}>{s.clockIn || '—'} → {s.clockOut || '—'}</td>
                <td style={{ padding: '14px 16px', fontWeight: '600' }}>{s.worked}</td>
                <td style={{ padding: '14px 16px' }}>{s.status}</td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <button onClick={() => navigate(`/attendance-manager/team-review/${s.staffId || s.id || 'EMP-0012'}/${new Date().toISOString().split('T')[0]}`)} style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '12px', cursor: 'pointer' }}>Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Staff Detail Responsive Modal / Bottom Sheet */}
      <ResponsiveModalSheet
        isOpen={Boolean(selectedStaff)}
        onClose={() => setSelectedStaff(null)}
        title={selectedStaff ? `${selectedStaff.name}'s Attendance Details` : 'Staff Attendance Details'}
      >
        {selectedStaff && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ backgroundColor: 'var(--surface-2)', padding: '14px', borderRadius: '12px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong style={{ color: 'var(--text-primary)' }}>Staff Member:</strong> {selectedStaff.name} ({selectedStaff.staffId})</div>
              <div><strong style={{ color: 'var(--text-primary)' }}>Designation:</strong> {selectedStaff.designation}</div>
              <div><strong style={{ color: 'var(--text-primary)' }}>Branch:</strong> {selectedStaff.branch}</div>
              <div><strong style={{ color: 'var(--text-primary)' }}>Shift Schedule:</strong> {selectedStaff.shift}</div>
              <div><strong style={{ color: 'var(--text-primary)' }}>Clock In / Out:</strong> {selectedStaff.clockIn || '—'} → {selectedStaff.clockOut || '—'}</div>
              <div><strong style={{ color: 'var(--text-primary)' }}>Worked Today:</strong> {selectedStaff.worked} {selectedStaff.lateMinutes > 0 ? <span style={{ color: 'var(--warning)' }}>(Late {selectedStaff.lateMinutes}m)</span> : ''}</div>
            </div>

            <div style={{ paddingBottom: 'calc(10px + env(safe-area-inset-bottom))' }}>
              <button
                type="button"
                onClick={() => setSelectedStaff(null)}
                style={{ width: '100%', height: '46px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: '600', cursor: 'pointer' }}
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </ResponsiveModalSheet>
    </div>
  );
};
