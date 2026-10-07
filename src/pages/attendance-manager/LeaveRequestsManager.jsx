import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { attendanceManagerService } from '../../services/attendanceManager.service';

export const LeaveRequestsManager = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await attendanceManagerService.getApprovals();
      const rows = Array.isArray(data) ? data : [];
      setRequests(
        rows.filter((item) =>
          ['Leave', 'Leave Request'].includes(item.type),
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (item, decision) => {
    const note = window.prompt(
      decision === 'approve'
        ? 'Approval note (optional)'
        : 'Rejection reason',
      '',
    );
    if (decision === 'reject' && !note) return;

    await attendanceManagerService.updateApprovalStatus(
      item.id,
      decision,
      note || '',
    );
    await load();
  };

  const pendingCount = requests.filter((item) => item.status === 'Pending').length;

  if (loading) {
    return <div className="am-loading-state">Loading leave requests…</div>;
  }

  return (
    <div className="attendance-manager-module attendance-manager-leave">
      <section className="am-section-header">
        <div>
          <h2>Leave Requests</h2>
          <p>Employee leave requests appear here immediately after submission.</p>
        </div>
        <span className="am-count-badge">{pendingCount} Pending</span>
      </section>

      {requests.length === 0 ? (
        <div className="am-empty-state">No leave requests.</div>
      ) : (
        <div className="am-approval-grid">
          {requests.map((item) => (
            <article key={item.id} className="am-approval-card">
              <div className="am-approval-card__head">
                <div className="am-approval-person">
                  <div className="am-approval-avatar-fallback">
                    {(item.staffName || 'S').slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <strong>{item.staffName || 'Staff'}</strong>
                    <span>{item.staffId || 'Employee'}</span>
                  </div>
                </div>

                <span className={`am-status-badge am-status-badge--${String(item.status || '').toLowerCase()}`}>
                  {item.status}
                </span>
              </div>

              <div className="am-approval-details">
                <div>
                  <span>Start Date</span>
                  <strong>{item.date || item.affectedDate || '—'}</strong>
                </div>
                <div>
                  <span>Type</span>
                  <strong>{item.leaveType || 'Leave'}</strong>
                </div>
                <div className="am-approval-details__wide">
                  <span>Reason</span>
                  <strong>{item.reason || 'No reason provided.'}</strong>
                </div>
              </div>

              {item.status === 'Pending' ? (
                <div className="am-approval-actions">
                  <button
                    onClick={() => update(item, 'approve')}
                    className="am-approve-button"
                  >
                    <Check size={14}/>
                    Approve
                  </button>
                  <button
                    onClick={() => update(item, 'reject')}
                    className="am-reject-button"
                  >
                    <X size={14}/>
                    Reject
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
