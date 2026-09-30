import React, { useState, useEffect } from 'react';
import { Check, X, ShieldX } from 'lucide-react';
import { attendanceManagerService } from '../../services/attendanceManager.service';
import { ResponsiveModalSheet } from '../../components/common/ResponsiveModalSheet';

export const Approvals = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewDecision, setReviewDecision] = useState(null); // 'approve' | 'reject'
  const [managerNote, setManagerNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const data = await attendanceManagerService.getApprovals();
      setApprovals(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (req, decision) => {
    setSelectedRequest(req);
    setReviewDecision(decision);
    setManagerNote('');
  };

  const handleConfirmDecision = async (e) => {
    e.preventDefault();
    if (!selectedRequest || !reviewDecision) return;

    setSubmitting(true);
    try {
      await attendanceManagerService.updateApprovalStatus(selectedRequest.id, reviewDecision, managerNote);
      setSelectedRequest(null);
      setReviewDecision(null);
      fetchApprovals();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = typeFilter === 'All'
    ? approvals
    : approvals.filter(a => a.type === typeFilter);

  const kpis = [
    { label: "Pending Requests", value: approvals.filter(a => a.status === 'Pending').length, accent: "var(--warning)" },
    { label: "Leave Requests", value: approvals.filter(a => a.type === 'Leave Request').length, accent: "var(--primary)" },
    { label: "Punch Corrections", value: approvals.filter(a => a.type === 'Punch Correction').length, accent: "var(--danger)" },
    { label: "Overtime Requests", value: approvals.filter(a => a.type === 'Overtime').length, accent: "var(--success)" }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* 2x2 Summary Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '10px',
        width: '100%'
      }}>
        {kpis.map((k, i) => (
          <div
            key={i}
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '76px'
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>{k.label}</span>
            <div style={{ fontSize: '20px', fontWeight: '800', color: k.accent, marginTop: '2px' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filter Chip Row */}
      <div className="attendance-filter-scroll scroll-hidden">
        {['All', 'Leave Request', 'Punch Correction', 'Overtime'].map(ft => (
          <button
            key={ft}
            onClick={() => setTypeFilter(ft)}
            style={{
              height: '36px',
              padding: '0 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: typeFilter === ft ? '700' : '500',
              backgroundColor: typeFilter === ft ? 'var(--primary)' : 'var(--surface-2)',
              color: typeFilter === ft ? '#ffffff' : 'var(--text-secondary)',
              border: typeFilter === ft ? '1px solid var(--primary)' : '1px solid var(--border)',
              cursor: 'pointer'
            }}
          >
            {ft}
          </button>
        ))}
      </div>

      {/* Approvals Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
        {filtered.map((req) => (
          <div
            key={req.id}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={req.avatar} alt="Staff" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{req.staffName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{req.staffId} • {req.branch}</div>
                </div>
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: req.status === 'Pending' ? 'var(--warning-soft)' : (req.status === 'Approved' ? 'var(--success-soft)' : 'var(--danger-soft)'),
                color: req.status === 'Pending' ? 'var(--warning)' : (req.status === 'Approved' ? 'var(--success)' : 'var(--danger)')
              }}>
                {req.status.toUpperCase()}
              </span>
            </div>

            <div style={{ backgroundColor: 'var(--surface-2)', padding: '10px', borderRadius: '10px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div><strong style={{ color: 'var(--text-primary)' }}>Request Type:</strong> {req.type}</div>
              <div><strong style={{ color: 'var(--text-primary)' }}>Affected Date:</strong> {req.affectedDate}</div>
              <div><strong style={{ color: 'var(--text-primary)' }}>Details:</strong> {req.originalValue} → <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{req.requestedValue}</span></div>
              <div><strong style={{ color: 'var(--text-primary)' }}>Reason:</strong> {req.reason}</div>
            </div>

            {/* Self Approval Guard vs Review Actions */}
            {req.isSelfRequest ? (
              <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--danger-soft)', color: 'var(--danger)', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldX size={14} /> Self-Approval Block: This request must be reviewed by another authorized manager.
              </div>
            ) : (
              req.status === 'Pending' && (
                <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
                  <button
                    onClick={() => handleOpenReview(req, 'approve')}
                    style={{ flex: 1, height: '36px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--success)', color: '#ffffff', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    <Check size={14} /> Approve
                  </button>
                  <button
                    onClick={() => handleOpenReview(req, 'reject')}
                    style={{ flex: 1, height: '36px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--danger)', color: '#ffffff', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    <X size={14} /> Reject
                  </button>
                </div>
              )
            )}
          </div>
        ))}
      </div>

      {/* Responsive Review Modal / Bottom Sheet */}
      <ResponsiveModalSheet
        isOpen={Boolean(selectedRequest && reviewDecision)}
        onClose={() => {
          setSelectedRequest(null);
          setReviewDecision(null);
        }}
        title={reviewDecision === 'approve' ? 'Approve Request' : 'Reject Request'}
      >
        {selectedRequest && (
          <form onSubmit={handleConfirmDecision} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', backgroundColor: 'var(--surface-2)', padding: '10px 12px', borderRadius: '8px' }}>
              Staff: <strong>{selectedRequest.staffName} ({selectedRequest.staffId})</strong>
              <br />
              Type: <strong>{selectedRequest.type}</strong> | Date: <strong>{selectedRequest.affectedDate}</strong>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {reviewDecision === 'approve' ? 'Manager Approval Note (Optional)' : 'Rejection Reason (Required)'}
              </label>
              <textarea
                value={managerNote}
                onChange={(e) => setManagerNote(e.target.value)}
                placeholder={reviewDecision === 'approve' ? 'Add note for staff...' : 'State clear rejection grounds...'}
                rows={3}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '13px', boxSizing: 'border-box' }}
                required={reviewDecision === 'reject'}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '6px', paddingBottom: 'calc(10px + env(safe-area-inset-bottom))' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedRequest(null);
                  setReviewDecision(null);
                }}
                style={{ flex: 1, height: '46px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 1,
                  height: '46px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: reviewDecision === 'approve' ? 'var(--success)' : 'var(--danger)',
                  color: '#ffffff',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {submitting ? 'Confirming...' : `Confirm ${reviewDecision === 'approve' ? 'Approval' : 'Rejection'}`}
              </button>
            </div>
          </form>
        )}
      </ResponsiveModalSheet>
    </div>
  );
};
