import React, { useState, useEffect } from 'react';
import { FilePlus, Paperclip } from 'lucide-react';
import { leaveService } from '../../services/leave.service';
import { ResponsiveModalSheet } from '../../components/common/ResponsiveModalSheet';

export const LeaveRequests = () => {
  const [balances, setBalances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplySheet, setShowApplySheet] = useState(false);

  // Form State
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [leaveMode, setLeaveMode] = useState('Full Day');
  const [halfDaySession, setHalfDaySession] = useState('First Half');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [balData, reqData] = await Promise.all([
        leaveService.getLeaveBalances(),
        leaveService.getLeaveRequests()
      ]);
      setBalances(balData);
      setRequests(reqData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) return;

    setSubmitting(true);
    try {
      await leaveService.applyLeaveRequest({
        type: leaveType,
        leaveMode,
        halfDaySession: leaveMode === 'Half Day' ? halfDaySession : null,
        startDate,
        endDate,
        daysCount: leaveMode === 'Half Day' ? 0.5 : 1,
        reason,
        attachment: attachment ? attachment.name : null
      });
      setShowApplySheet(false);
      fetchData();
      setReason('');
      setAttachment(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (id) => {
    try {
      await leaveService.cancelLeaveRequest(id);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="attendance-module attendance-leave-page" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* Top Section: Leave Balances & Apply Button */}
      <div className="attendance-module-heading-row" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
          Personal Leave Balances
        </div>
        <button
          onClick={() => setShowApplySheet(true)}
          className="attendance-primary-button"
          style={{
            padding: '10px 16px',
            borderRadius: '10px',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            border: 'none',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FilePlus size={16} /> Apply Leave
        </button>
      </div>

      {/* Leave Balances Grid (2x2 Mobile / 3 Desktop) */}
      <div className="leave-balance-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        width: '100%'
      }}>
        {balances.map((b) => (
          <div
            key={b.id}
            className="attendance-kpi-card leave-balance-card"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>
              {b.type}
            </span>
            <div style={{ fontSize: '22px', fontWeight: '800', color: b.color }}>
              {b.available} <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)' }}>Available</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', paddingTop: '4px', borderTop: '1px solid var(--border)' }}>
              <span>Alloc: {b.allocated}</span>
              <span>Used: {b.used}</span>
              <span>Pend: {b.pending}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Leave Requests Header */}
      <div className="attendance-section-title" style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '8px' }}>
        Leave Application Records
      </div>

      {/* Mobile Card List View (< 768px) */}
      <div className="mobile-card-view" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
        {requests.map((req) => (
          <div
            key={req.id}
            className="attendance-record-card leave-request-card"
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
              <div>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {req.type}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                  ({req.leaveMode})
                </span>
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: req.status === 'Approved' ? 'var(--success-soft)' : (req.status === 'Pending' ? 'var(--warning-soft)' : 'var(--danger-soft)'),
                color: req.status === 'Approved' ? 'var(--success)' : (req.status === 'Pending' ? 'var(--warning)' : 'var(--danger)')
              }}>
                {req.status.toUpperCase()}
              </span>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              <strong>{req.startDate}</strong> {req.startDate !== req.endDate ? `to ${req.endDate}` : ''} ({req.daysCount} Day{req.daysCount > 1 ? 's' : ''})
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-muted)', backgroundColor: 'var(--surface-2)', padding: '8px 10px', borderRadius: '8px' }}>
              Reason: {req.reason}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Submitted: {new Date(req.submittedAt).toLocaleDateString()}</span>

              {req.canCancel && req.status === 'Pending' && (
                <button
                  onClick={() => handleCancelRequest(req.id)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--danger-soft)',
                    color: 'var(--danger)',
                    border: '1px solid var(--danger)',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel Request
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="desktop-table-view attendance-table-card" style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        overflow: 'hidden',
        width: '100%'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px 16px', fontWeight: '700' }}>Leave Type</th>
              <th style={{ padding: '12px 16px', fontWeight: '700' }}>Dates</th>
              <th style={{ padding: '12px 16px', fontWeight: '700' }}>Duration</th>
              <th style={{ padding: '12px 16px', fontWeight: '700' }}>Reason</th>
              <th style={{ padding: '12px 16px', fontWeight: '700' }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: '700', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                <td style={{ padding: '14px 16px', fontWeight: '600' }}>
                  {req.type} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({req.leaveMode})</span>
                </td>
                <td style={{ padding: '14px 16px' }}>{req.startDate} → {req.endDate}</td>
                <td style={{ padding: '14px 16px', fontWeight: '600' }}>{req.daysCount} Days</td>
                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{req.reason}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: req.status === 'Approved' ? 'var(--success-soft)' : (req.status === 'Pending' ? 'var(--warning-soft)' : 'var(--danger-soft)'),
                    color: req.status === 'Approved' ? 'var(--success)' : (req.status === 'Pending' ? 'var(--warning)' : 'var(--danger)')
                  }}>
                    {req.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  {req.canCancel && req.status === 'Pending' && (
                    <button
                      onClick={() => handleCancelRequest(req.id)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--danger-soft)',
                        color: 'var(--danger)',
                        border: '1px solid var(--danger)',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Apply Leave Responsive Modal / Bottom Sheet */}
      <ResponsiveModalSheet
        isOpen={showApplySheet}
        onClose={() => setShowApplySheet(false)}
        title="Apply for Leave"
      >
        <form onSubmit={handleApplyLeave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-row-2col" style={{ display: 'grid', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Leave Type *
              </label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box' }}
              >
                <option value="Casual Leave">Casual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Annual Leave">Annual Leave</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Duration *
              </label>
              <select
                value={leaveMode}
                onChange={(e) => setLeaveMode(e.target.value)}
                style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box' }}
              >
                <option value="Full Day">Full Day</option>
                <option value="Half Day">Half Day</option>
              </select>
            </div>
          </div>

          {leaveMode === 'Half Day' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Half Day Session</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setHalfDaySession('First Half')}
                  style={{ flex: 1, height: '42px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: halfDaySession === 'First Half' ? 'var(--primary)' : 'var(--surface-2)', color: halfDaySession === 'First Half' ? '#fff' : 'var(--text-primary)', fontWeight: '600', cursor: 'pointer' }}
                >
                  First Half (Morning)
                </button>
                <button
                  type="button"
                  onClick={() => setHalfDaySession('Second Half')}
                  style={{ flex: 1, height: '42px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: halfDaySession === 'Second Half' ? 'var(--primary)' : 'var(--surface-2)', color: halfDaySession === 'Second Half' ? '#fff' : 'var(--text-primary)', fontWeight: '600', cursor: 'pointer' }}
                >
                  Second Half (Afternoon)
                </button>
              </div>
            </div>
          )}

          <div className="form-row-2col" style={{ display: 'grid', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                End Date *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Reason *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Detail your leave reason..."
              rows={3}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '13px', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px', paddingBottom: 'calc(10px + env(safe-area-inset-bottom))' }}>
            <button
              type="button"
              onClick={() => setShowApplySheet(false)}
              style={{ flex: 1, height: '46px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontWeight: '600', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ flex: 1, height: '46px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--primary)', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </ResponsiveModalSheet>
    </div>
  );
};
