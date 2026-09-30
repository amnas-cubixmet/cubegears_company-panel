import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { attendanceManagerService } from '../../services/attendanceManager.service';
import { ResponsiveModalSheet } from '../../components/common/ResponsiveModalSheet';
import { ExportButton } from '../../components/common/ExportButton';

export const MasterRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showManualEntrySheet, setShowManualEntrySheet] = useState(false);

  // Manual entry state
  const [staffName, setStaffName] = useState('Ajmal K');
  const [entryDate, setEntryDate] = useState('2026-09-12');
  const [clockIn, setClockIn] = useState('09:00 AM');
  const [clockOut, setClockOut] = useState('06:00 PM');
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await attendanceManagerService.getMasterRecords();
      setRecords(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManualEntry = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    const newRecord = {
      id: `MST-${Math.floor(900 + Math.random() * 90)}`,
      date: entryDate,
      staffId: "EMP-0012",
      name: staffName,
      branch: "Main Workshop",
      shift: "General Shift",
      clockIn,
      clockOut,
      worked: "9h 00m",
      status: "Present",
      correction: "Manual Entry",
      modifiedBy: "Branch Manager",
      reason
    };
    setRecords([newRecord, ...records]);
    setShowManualEntrySheet(false);
    setReason('');
  };

  const filtered = records.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.date.includes(searchQuery) ||
    (r.branch && r.branch.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const exportColumns = [
    { label: 'Date', key: 'date' },
    { label: 'Staff ID', key: 'staffId' },
    { label: 'Staff Name', key: 'name' },
    { label: 'Branch', key: 'branch' },
    { label: 'Shift', key: 'shift' },
    { label: 'Clock In', key: 'clockIn' },
    { label: 'Clock Out', key: 'clockOut' },
    { label: 'Worked Hours', key: 'worked' },
    { label: 'Attendance Status', key: 'status' },
    { label: 'Correction Status', key: 'correction' },
    { label: 'Modified By', key: 'modifiedBy' },
    { label: 'Audit Reason', key: 'reason' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff, date, branch..."
            style={{ width: '100%', height: '38px', paddingLeft: '36px', paddingRight: '12px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowManualEntrySheet(true)}
            style={{ height: '38px', padding: '0 14px', borderRadius: '10px', backgroundColor: 'var(--primary)', color: '#ffffff', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} /> Manual Entry
          </button>

          <ExportButton
            data={filtered}
            columns={exportColumns}
            filenamePrefix="cubegears-master-attendance"
          />
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-card-view" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
        {filtered.map(r => (
          <div key={r.id} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{r.name}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.date}</span>
            </div>
            <div style={{ backgroundColor: 'var(--surface-2)', padding: '10px', borderRadius: '10px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div><strong>Shift:</strong> {r.shift} • {r.branch}</div>
              <div><strong>Punches:</strong> {r.clockIn} → {r.clockOut} ({r.worked})</div>
              <div><strong>Modified By:</strong> {r.modifiedBy}</div>
              {r.reason && <div style={{ color: 'var(--text-muted)' }}><strong>Audit Note:</strong> {r.reason}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="desktop-table-view" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px 16px' }}>Date</th>
              <th style={{ padding: '12px 16px' }}>Staff</th>
              <th style={{ padding: '12px 16px' }}>Branch</th>
              <th style={{ padding: '12px 16px' }}>Punches</th>
              <th style={{ padding: '12px 16px' }}>Worked</th>
              <th style={{ padding: '12px 16px' }}>Audit History</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 16px', fontWeight: '600' }}>{r.date}</td>
                <td style={{ padding: '14px 16px', fontWeight: '600' }}>{r.name}</td>
                <td style={{ padding: '14px 16px' }}>{r.branch}</td>
                <td style={{ padding: '14px 16px' }}>{r.clockIn} → {r.clockOut}</td>
                <td style={{ padding: '14px 16px', fontWeight: '600' }}>{r.worked}</td>
                <td style={{ padding: '14px 16px', fontSize: '11px', color: 'var(--text-muted)' }}>By: {r.modifiedBy} • {r.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Manual Entry Responsive Modal / Bottom Sheet */}
      <ResponsiveModalSheet
        isOpen={showManualEntrySheet}
        onClose={() => setShowManualEntrySheet(false)}
        title="Authorized Manual Attendance Entry"
      >
        <form onSubmit={handleCreateManualEntry} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Staff Member *
            </label>
            <input
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div className="form-row-2col" style={{ display: 'grid', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Clock In Time *
              </label>
              <input
                type="text"
                value={clockIn}
                onChange={(e) => setClockIn(e.target.value)}
                style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Clock Out Time *
              </label>
              <input
                type="text"
                value={clockOut}
                onChange={(e) => setClockOut(e.target.value)}
                style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Authorized Reason (Required for Audit Trail) *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="State clear operational reason..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '13px', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px', paddingBottom: 'calc(10px + env(safe-area-inset-bottom))' }}>
            <button
              type="button"
              onClick={() => setShowManualEntrySheet(false)}
              style={{ flex: 1, height: '46px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontWeight: '600', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ flex: 1, height: '46px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--primary)', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}
            >
              Save Entry
            </button>
          </div>
        </form>
      </ResponsiveModalSheet>
    </div>
  );
};
