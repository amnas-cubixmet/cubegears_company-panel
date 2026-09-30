import React, { useState } from 'react';
import { DollarSign, CheckCircle2, FileText, CreditCard, History } from 'lucide-react';

export const PayrollCard = ({ payroll, onRecordPayment, onViewDetails, onViewPayslip, onViewHistory }) => {
  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const getApprovalBadgeColor = (status) => {
    switch (status) {
      case 'Approved': return { bg: 'var(--success-soft)', color: 'var(--success)' };
      case 'Reviewed': return { bg: 'var(--info-soft, rgba(59,130,246,0.1))', color: 'var(--info)' };
      case 'Submitted': return { bg: 'var(--warning-soft)', color: 'var(--warning)' };
      case 'Rejected': return { bg: 'var(--danger-soft)', color: 'var(--danger)' };
      default: return { bg: 'var(--surface-2)', color: 'var(--text-muted)' };
    }
  };

  const getSettlementBadgeColor = (status) => {
    switch (status) {
      case 'Paid': return { bg: 'var(--success-soft)', color: 'var(--success)' };
      case 'Partially Paid': return { bg: 'var(--warning-soft)', color: 'var(--warning)' };
      default: return { bg: 'var(--danger-soft)', color: 'var(--danger)' };
    }
  };

  const appBadge = getApprovalBadgeColor(payroll.approvalStatus);
  const setBadge = getSettlementBadgeColor(payroll.paymentStatus);

  const basic = payroll.baseSalary || 0;
  const allowances = payroll.allowances || 0;
  const otHours = payroll.overtimeHours || '0h';
  const otPay = payroll.overtimePay || 0;
  const gross = payroll.grossSalary || (basic + allowances + otPay);
  const deductions = (payroll.deductions || 0) + (payroll.advanceRecovery || 0);
  const paid = payroll.paidAmount || 0;
  const balance = payroll.netSalary - paid;

  return (
    <div className="payroll-record-card" style={{
      width: '100%',
      maxWidth: '100%',
      minWidth: 0,
      backgroundColor: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxSizing: 'border-box'
    }}>
      {/* Top Row: Staff Name + Approval Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>
            {payroll.staffName}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {payroll.designation} • {payroll.branch}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '4px', fontWeight: '700' }}>
            Salary Type: {payroll.salaryBasis || 'Fixed Monthly'}
            {payroll.salaryBasis === 'Hourly' && payroll.salaryRate ? ` • ${formatINR(payroll.salaryRate)}/hour` : ''}
            {payroll.salaryBasis === 'Daily' && payroll.salaryRate ? ` • ${formatINR(payroll.salaryRate)}/day` : ''}
          </div>
        </div>
        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          padding: '3px 10px',
          borderRadius: '8px',
          backgroundColor: appBadge.bg,
          color: appBadge.color,
          whiteSpace: 'nowrap'
        }}>
          {payroll.approvalStatus}
        </span>
      </div>

      {/* Detailed Financial Breakdown Grid */}
      <div className="payroll-record-breakdown" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '10px',
        padding: '12px 0',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        fontSize: '13px'
      }}>
        <div style={{ backgroundColor: 'var(--surface-2)', padding: '8px 10px', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {payroll.salaryBasis === 'Hourly' ? 'Worked-hours Pay' : payroll.salaryBasis === 'Daily' ? 'Present-days Pay' : payroll.salaryBasis === 'Commission Only' ? 'Base Pay' : 'Fixed Monthly Salary'}
          </div>
          <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{formatINR(basic)}</div>
        </div>

        <div style={{ backgroundColor: 'var(--surface-2)', padding: '8px 10px', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Allowances</div>
          <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{formatINR(allowances)}</div>
        </div>

        <div style={{ backgroundColor: 'var(--surface-2)', padding: '8px 10px', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Approved OT ({otHours})</div>
          <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{formatINR(otPay)}</div>
        </div>

        <div style={{ backgroundColor: 'var(--surface-2)', padding: '8px 10px', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Fixed Incentive</div>
          <div style={{ fontWeight: '700', color: 'var(--success)' }}>{formatINR(payroll.fixedIncentives || 0)}</div>
        </div>

        <div style={{ backgroundColor: 'var(--surface-2)', padding: '8px 10px', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Workshop / Job Incentive</div>
          <div style={{ fontWeight: '700', color: 'var(--success)' }}>{formatINR(payroll.approvedCommission || 0)}</div>
        </div>

        <div style={{ backgroundColor: 'var(--surface-2)', padding: '8px 10px', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Gross Pay</div>
          <div style={{ fontWeight: '800', color: 'var(--text-primary)' }}>{formatINR(gross)}</div>
        </div>

        <div style={{ backgroundColor: 'var(--surface-2)', padding: '8px 10px', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Deductions</div>
          <div style={{ fontWeight: '700', color: 'var(--danger)' }}>{formatINR(deductions)}</div>
        </div>

        <div style={{ backgroundColor: 'var(--surface-2)', padding: '8px 10px', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Net Salary</div>
          <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '15px' }}>{formatINR(payroll.netSalary)}</div>
        </div>
      </div>

      {/* Settlement & Paid Details Row */}
      <div className="payroll-record-settlement" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface-2)', padding: '10px 12px', borderRadius: '10px' }}>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Paid: <strong>{formatINR(paid)}</strong></span>
          <span style={{ fontSize: '13px', fontWeight: '800', color: balance > 0 ? 'var(--warning)' : 'var(--success)' }}>
            Balance: {formatINR(balance)}
          </span>
        </div>

        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          padding: '3px 10px',
          borderRadius: '8px',
          backgroundColor: setBadge.bg,
          color: setBadge.color
        }}>
          {payroll.paymentStatus}
        </span>
      </div>

      {/* Main Action Buttons */}
      <div className="payroll-record-actions" style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
        <button
          onClick={() => onRecordPayment(payroll)}
          disabled={payroll.paymentStatus === 'Paid' || payroll.approvalStatus !== 'Approved'}
          style={{
            flex: 1,
            height: '42px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: '700',
            cursor: (payroll.paymentStatus === 'Paid' || payroll.approvalStatus !== 'Approved') ? 'not-allowed' : 'pointer',
            opacity: (payroll.paymentStatus === 'Paid' || payroll.approvalStatus !== 'Approved') ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <CreditCard size={15} /> Record Payment
        </button>

        <button
          onClick={() => onViewDetails(payroll)}
          style={{
            flex: 1,
            height: '42px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--surface-2)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          View Details
        </button>
      </div>

      {/* Secondary Menu Links */}
      <div className="payroll-record-links" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '2px' }}>
        <button
          onClick={() => onViewPayslip(payroll)}
          style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <FileText size={14} /> View Payslip
        </button>

        <button
          onClick={() => onViewHistory(payroll)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <History size={14} /> Payment History ({payroll.payments?.length || 0})
        </button>
      </div>
    </div>
  );
};
