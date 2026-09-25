import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { attendanceManagerService } from '../../services/attendanceManager.service';

export const LeaveRequestsManager = () => {
  const [requests, setRequests] = useState([]);

  const load = async () => {
    const data = await attendanceManagerService.getApprovals();
    setRequests(data.filter((item) => item.type === 'Leave Request'));
  };

  useEffect(() => { load(); }, []);

  const update = async (item, decision) => {
    const note = window.prompt(decision === 'approve' ? 'Approval note (optional)' : 'Rejection reason', '');
    if (decision === 'reject' && !note) return;
    await attendanceManagerService.updateApprovalStatus(item.id, decision, note || '');
    load();
  };

  const pendingCount = requests.filter((item) => item.status === 'Pending').length;

  return (
    <div className="attendance-manager-module attendance-manager-leave">
      <section className="am-section-header">
        <div>
          <h2>Leave Requests</h2>
          <p>Casual, sick, paid, unpaid and emergency leave approval queue.</p>
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
                  <img src={item.avatar} alt="" />
                  <div>
                    <strong>{item.staffName}</strong>
                    <span>{item.role} · {item.branch}</span>
                  </div>
                </div>
                <span className={`am-status-badge am-status-badge--${String(item.status || '').toLowerCase()}`}>
                  {item.status}
                </span>
              </div>

              <div className="am-approval-details">
                <div><span>Date</span><strong>{item.affectedDate}</strong></div>
                <div><span>Type</span><strong>{item.leaveType || 'Leave'}</strong></div>
                <div className="am-approval-details__wide"><span>Request</span><strong>{item.requestedValue}</strong></div>
                <div className="am-approval-details__wide"><span>Reason</span><strong>{item.reason}</strong></div>
              </div>

              {item.status === 'Pending' && !item.isSelfRequest ? (
                <div className="am-approval-actions">
                  <button onClick={() => update(item,'approve')} className="am-approve-button"><Check size={14}/>Approve</button>
                  <button onClick={() => update(item,'reject')} className="am-reject-button"><X size={14}/>Reject</button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
