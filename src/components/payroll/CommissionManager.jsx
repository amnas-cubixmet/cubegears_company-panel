import React, { useState, useEffect } from 'react';
import { commissionService } from '../../services/commission.service';
import { usePayrollPeriod } from '../../context/PayrollPeriodContext';
import { DollarSign, CheckCircle2, AlertCircle, Clock, Plus, Building, User } from 'lucide-react';

export const CommissionManager = () => {
  const { selectedMonth, selectedStaff, periodString } = usePayrollPeriod();
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    loadCommissions();
  }, [selectedMonth, selectedStaff]);

  const loadCommissions = async () => {
    setLoading(true);
    try {
      const data = await commissionService.getCommissions({
        month: periodString,
        staffId: selectedStaff
      });
      setCommissions(data);
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
    await commissionService.updateStatus(id, 'Approved');
    showToast('Commission record approved.');
    loadCommissions();
  };

  const handleReject = async (id) => {
    await commissionService.updateStatus(id, 'Rejected');
    showToast('Commission record rejected.');
    loadCommissions();
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Approved':
        return { backgroundColor: 'var(--success-soft)', color: 'var(--success)', border: '1px solid var(--success-soft)' };
      case 'Rejected':
        return { backgroundColor: 'var(--danger-soft)', color: 'var(--danger)', border: '1px solid var(--danger-soft)' };
      case 'Paid':
        return { backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', border: '1px solid var(--primary-soft)' };
      default:
        return { backgroundColor: 'var(--warning-soft)', color: 'var(--warning)', border: '1px solid var(--warning-soft)' };
    }
  };

  return (
    <div className="payroll-commission-module" style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {toastMsg && (
        <div style={{ backgroundColor: 'var(--success)', color: '#ffffff', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}>
          {toastMsg}
        </div>
      )}

      <div className="payroll-module-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            Workshop Incentives & Commission ({periodString})
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
            Job-card linked incentives for labour revenue, completed jobs, services, parts/sales and customer referrals.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={async () => {
              const staffName = prompt('Enter Staff Name:', 'Ajmal K');
              if (!staffName) return;
              const amountStr = prompt('Enter Authorized Commission Amount (₹):', '500');
              if (!amountStr) return;
              const reason = prompt('Enter Reason / Job Card Ref:', 'JOB-0120 Engine Tuning');
              
              await commissionService.createCommissionRecord({
                staffId: 'EMP-0012',
                staffName,
                payrollMonth: periodString,
                branch: 'Main Garage Branch',
                jobCardId: reason || 'JOB-MANUAL',
                customerName: 'Special Work Customer',
                vehicle: 'Custom Job Vehicle',
                serviceName: 'Manual Authorized Commission',
                category: 'Manual Incentive',
                method: 'Manual Authorized Commission',
                customerCharge: Number(amountStr),
                rate: 'Manual',
                amount: Number(amountStr),
                status: 'Approved',
                approvedBy: 'Workshop Manager',
                approvedAt: new Date().toLocaleString()
              });
              showToast('Manual Authorized Commission added successfully.');
              loadCommissions();
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={14} /> Add Manual Incentive
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Loading commission ledger...</div>
      ) : commissions.length === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-muted)', fontSize: '13px' }}>
          No commission records found for {periodString}.
        </div>
      ) : (
        <div className="payroll-commission-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
          {commissions.map((com) => (
            <div
              key={com.id}
              className="payroll-commission-card"
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
                  <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>{com.staffName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{com.category} • {com.jobCardId}</div>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    ...getStatusBadgeStyle(com.status)
                  }}
                >
                  {com.status}
                </span>
              </div>

              <div style={{ backgroundColor: 'var(--surface-2)', padding: '10px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                <div><strong style={{ color: 'var(--text-primary)' }}>Vehicle/Job:</strong> {com.vehicle}</div>
                <div><strong style={{ color: 'var(--text-primary)' }}>Service:</strong> {com.serviceName}</div>
                <div><strong style={{ color: 'var(--text-primary)' }}>Customer Charge:</strong> {formatINR(com.customerCharge)}</div>
                <div><strong style={{ color: 'var(--text-primary)' }}>Rate/Method:</strong> {com.method} ({com.rate})</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--success)', marginTop: '2px' }}>
                  Commission Earned: {formatINR(com.amount)}
                </div>
              </div>

              {com.status === 'Approved' && (
                <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: '600' }}>
                  ✓ Approved by {com.approvedBy} on {com.approvedAt}
                </div>
              )}

              {com.status === 'Pending' && (
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleApprove(com.id)}
                    style={{ flex: 1, height: '36px', borderRadius: '8px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Approve Commission
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(com.id)}
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
    </div>
  );
};
