import React, { useState, useEffect } from 'react';
import { overtimeService } from '../../services/overtime.service';
import { usePayrollPeriod } from '../../context/PayrollPeriodContext';
import { AddOvertimeSheet } from './AddOvertimeSheet';
import { Plus, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';

export const OvertimeManager = () => {
  const { selectedMonth, selectedYear, selectedBranch, selectedStaff, periodString } = usePayrollPeriod();
  const [overtimeList, setOvertimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    loadOvertime();
  }, [selectedMonth, selectedYear, selectedBranch, selectedStaff]);

  const loadOvertime = async () => {
    setLoading(true);
    try {
      const data = await overtimeService.getOvertime({
        month: periodString,
        branch: selectedBranch,
        staffId: selectedStaff
      });
      setOvertimeList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const handleApprove = async (id) => {
    await overtimeService.approveOvertime(id, { approvedBy: 'Branch Manager' });
    showToast('Overtime approved successfully.');
    loadOvertime();
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:', 'Not authorized for this shift');
    if (reason !== null) {
      await overtimeService.rejectOvertime(id, { rejectedBy: 'Branch Manager', reason });
      showToast('Overtime rejected.');
      loadOvertime();
    }
  };

  const handleCreateSave = async (otData) => {
    await overtimeService.createOvertime(otData);
    showToast('Overtime record submitted successfully.');
    loadOvertime();
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Approved':
        return { backgroundColor: 'var(--success-soft)', color: 'var(--success)', border: '1px solid var(--success-soft)' };
      case 'Rejected':
        return { backgroundColor: 'var(--danger-soft)', color: 'var(--danger)', border: '1px solid var(--danger-soft)' };
      case 'Pending':
        return { backgroundColor: 'var(--warning-soft)', color: 'var(--warning)', border: '1px solid var(--warning-soft)' };
      default:
        return { backgroundColor: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' };
    }
  };

  return (
    <div className="am-overtime-module payroll-overtime-module" style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {toastMsg && (
        <div style={{ backgroundColor: 'var(--success)', color: '#ffffff', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}>
          {toastMsg}
        </div>
      )}

      <div className="am-section-header am-overtime-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            Overtime Requests & Approvals ({periodString})
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
            Only manager-approved overtime enters monthly payroll calculations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="am-primary-button"
          style={{
            height: '42px',
            padding: '0 16px',
            borderRadius: '10px',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            border: 'none',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Plus size={16} /> Add Overtime
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Loading overtime records...</div>
      ) : overtimeList.length === 0 ? (
        <div className="am-empty-state" style={{ padding: '30px', textAlign: 'center', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-muted)', fontSize: '13px' }}>
          No overtime records found for {periodString}.
        </div>
      ) : (
        <div className="am-overtime-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
          {overtimeList.map((ot) => (
            <div
              key={ot.id}
              className="am-overtime-card"
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
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>{ot.staffName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Date: {ot.date} | {ot.shift}</div>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    ...getStatusBadgeStyle(ot.status)
                  }}
                >
                  {ot.status}
                </span>
              </div>

              <div className="am-overtime-details" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px', backgroundColor: 'var(--surface-2)', padding: '10px', borderRadius: '10px', fontSize: '12px' }}>
                <div>Hours: <strong>{ot.overtimeHours}h</strong></div>
                <div>Rate: <strong>₹{ot.rate}/hr</strong></div>
                <div>Method: <strong>{ot.calculationMethod}</strong></div>
                <div>Amount: <strong style={{ color: 'var(--primary)', fontSize: '14px' }}>{formatINR(ot.amount)}</strong></div>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Reason: {ot.reason}
              </div>

              {ot.status === 'Approved' && (
                <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: '600' }}>
                  ✓ Approved by {ot.approvedBy} ({ot.approvedAt})
                </div>
              )}

              {ot.status === 'Rejected' && (
                <div style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: '600' }}>
                  ✕ Rejected: {ot.rejectionReason}
                </div>
              )}

              {ot.status === 'Pending' && (
                <div className="am-approval-actions" style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleApprove(ot.id)}
                    className="am-approve-button"
                    style={{ flex: 1, height: '36px', borderRadius: '8px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(ot.id)}
                    className="am-reject-button"
                    style={{ flex: 1, height: '36px', borderRadius: '8px', backgroundColor: 'var(--danger-soft)', color: 'var(--danger)', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <AddOvertimeSheet
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleCreateSave}
      />
    </div>
  );
};
