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

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="text-base font-extrabold text-content">Leave Requests</div>
        <div className="mt-1 text-xs text-muted">Casual, sick, paid, unpaid and emergency leave approval queue.</div>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">No leave requests.</div>
      ) : requests.map((item) => (
        <div key={item.id} className="rounded-2xl border border-line bg-surface p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <img src={item.avatar} alt="" className="size-10 rounded-full object-cover"/>
              <div>
                <div className="text-sm font-extrabold text-content">{item.staffName}</div>
                <div className="text-[11px] text-muted">{item.role} · {item.branch}</div>
              </div>
            </div>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">{item.status}</span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 rounded-xl bg-surface-2 p-3 text-xs sm:grid-cols-2">
            <div>Date: <strong>{item.affectedDate}</strong></div>
            <div>Type: <strong>{item.leaveType || 'Leave'}</strong></div>
            <div className="sm:col-span-2">Request: <strong>{item.requestedValue}</strong></div>
            <div className="sm:col-span-2">Reason: <strong>{item.reason}</strong></div>
          </div>

          {item.status === 'Pending' && !item.isSelfRequest ? (
            <div className="mt-3 flex gap-2">
              <button onClick={() => update(item,'approve')} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border-0 bg-emerald-600 text-xs font-bold text-white"><Check size={14}/>Approve</button>
              <button onClick={() => update(item,'reject')} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border-0 bg-red-500 text-xs font-bold text-white"><X size={14}/>Reject</button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};
