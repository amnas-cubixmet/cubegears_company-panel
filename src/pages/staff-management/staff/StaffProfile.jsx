import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, User, Shield, Briefcase, Clock, DollarSign, FileText, Activity, Send, CheckCircle2, AlertCircle, Edit, Lock, Unlock, Upload } from 'lucide-react';
import { staffService } from '../../../services/staff.service';

export const StaffProfile = ({ staffId, onBack }) => {
  const [staff, setStaff] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [toastMsg, setToastMsg] = useState('');
  const tabsRef = useRef(null);
  const activeTabRef = useRef(null);

  const tabs = [
    'Overview',
    'Account & Access',
    'Work & Shift',
    'Attendance & Leave',
    'Salary & Payroll',
    'Documents',
    'Activity History'
  ];

  useEffect(() => {
    loadStaff();
  }, [staffId]);

  useEffect(() => {
    if (activeTabRef.current && tabsRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [activeTab]);

  const loadStaff = async () => {
    try {
      const data = await staffService.getStaffById(staffId);
      setStaff(data);
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSendInvite = async () => {
    await staffService.sendLoginInvite(staff.id);
    showToast('Login invite sent successfully (Mock mode).');
    loadStaff();
  };

  const handleToggleAccount = async () => {
    await staffService.toggleAccountStatus(staff.id);
    showToast(`Account ${staff.accountStatus === 'Active' ? 'deactivated' : 'activated'} successfully.`);
    loadStaff();
  };

  if (!staff) return <div style={{ padding: '20px', color: 'var(--text-muted)' }}>Loading staff profile...</div>;

  return (
    <div className="staff-profile" style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* Toast */}
      {toastMsg && (
        <div style={{ backgroundColor: 'var(--success)', color: '#fff', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}>
          {toastMsg}
        </div>
      )}

      {/* Back & Profile Header */}
      <div className="staff-profile-topbar" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={onBack}
          style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ArrowLeft size={18} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>Staff Profile</h2>
      </div>

      {/* Compact Header Card */}
      <div className="staff-profile-hero" style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '14px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={staff.photo} alt={staff.name} style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>{staff.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{staff.id} • {staff.designation} • {staff.branch}</div>
          </div>
        </div>

        <span style={{
          fontSize: '12px',
          fontWeight: '700',
          padding: '4px 10px',
          borderRadius: '8px',
          backgroundColor: staff.accountStatus === 'Active' ? 'var(--success-soft)' : 'var(--danger-soft)',
          color: staff.accountStatus === 'Active' ? 'var(--success)' : 'var(--danger)'
        }}>
          {staff.accountStatus}
        </span>
      </div>

      {/* 7 Tab Horizontal Scroll Rail */}
      <div className="staff-profile-tabs" style={{ width: '100%', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
        <div
          ref={tabsRef}
          className="scroll-hidden"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            padding: '0 10px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {tabs.map((t) => (
            <button
              key={t}
              ref={activeTab === t ? activeTabRef : null}
              onClick={() => setActiveTab(t)}
              style={{
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: activeTab === t ? '700' : '500',
                color: activeTab === t ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === t ? '2px solid var(--primary)' : '2px solid transparent',
                background: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderTop: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Panels */}
      <div className="staff-profile-panel" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px' }}>
        {activeTab === 'Overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '13px' }}>
            <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Full Name</span> <strong>{staff.name}</strong></div>
            <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Staff ID</span> <strong>{staff.id}</strong></div>
            <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Phone</span> <strong>{staff.phone}</strong></div>
            <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Email</span> <strong>{staff.email}</strong></div>
            <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Designation</span> <strong>{staff.designation}</strong></div>
            <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Company</span> <strong>{staff.company}</strong></div>
            <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Branch</span> <strong>{staff.branch}</strong></div>
            <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Joining Date</span> <strong>{staff.joiningDate}</strong></div>
          </div>
        )}

        {activeTab === 'Account & Access' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '13px' }}>
              <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Login Status</span> <strong>{staff.loginStatus}</strong></div>
              <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Assigned Role</span> <strong>{staff.role}</strong></div>
              <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Last Login</span> <strong>{staff.lastLogin}</strong></div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
              <button
                onClick={handleSendInvite}
                style={{ padding: '8px 14px', borderRadius: '8px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Send size={14} /> Send Login Invite
              </button>

              <button
                onClick={handleToggleAccount}
                style={{ padding: '8px 14px', borderRadius: '8px', backgroundColor: staff.accountStatus === 'Active' ? 'var(--danger-soft)' : 'var(--success-soft)', color: staff.accountStatus === 'Active' ? 'var(--danger)' : 'var(--success)', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {staff.accountStatus === 'Active' ? <Lock size={14} /> : <Unlock size={14} />}
                {staff.accountStatus === 'Active' ? 'Deactivate Account' : 'Activate Account'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'Work & Shift' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '13px' }}>
            <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Assigned Branch</span> <strong>{staff.branch}</strong></div>
            <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Reporting Manager</span> <strong>{staff.reportingManager}</strong></div>
            <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Shift Timing</span> <strong>{staff.shift}</strong></div>
            <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Weekly Off</span> <strong>{staff.weeklyOff}</strong></div>
          </div>
        )}

        {activeTab === 'Attendance & Leave' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            <div style={{ backgroundColor: 'var(--surface-2)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Present Days (This Month)</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--success)' }}>22 Days</div>
            </div>
            <div style={{ backgroundColor: 'var(--surface-2)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Worked Hours</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--info)' }}>176h 30m</div>
            </div>
            <div style={{ backgroundColor: 'var(--surface-2)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Leave Balance</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>12 Days</div>
            </div>
          </div>
        )}

        {activeTab === 'Salary & Payroll' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Payment Type Banner */}
            <div style={{ backgroundColor: 'var(--surface-2)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Staff Payment Type</span>
                <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)' }}>{staff.paymentType || 'Monthly Salary'}</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '8px', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}>
                {staff.paymentType === 'Commission' ? 'Commission Only' : staff.paymentType === 'Salary + Commission' ? 'Base Salary + Commission' : 'Salary Based'}
              </span>
            </div>

            {/* Salary Structure (For Salary-based and Salary + Commission) */}
            {staff.paymentType !== 'Commission' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Salary Structure Breakdown</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                  <div style={{ backgroundColor: 'var(--surface-2)', padding: '12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Basic Salary</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>₹{staff.salary?.basic.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--surface-2)', padding: '12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Allowances</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>₹{staff.salary?.allowances.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--surface-2)', padding: '12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Gross Base Salary</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--success)' }}>₹{staff.salary?.grossSalary.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Commission Rules Section (For Commission and Salary + Commission) */}
            {(staff.paymentType === 'Commission' || staff.paymentType === 'Salary + Commission') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'var(--surface-2)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>Active Commission Rules</div>
                {staff.commissionRules ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '12px' }}>
                    <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Commission Method</span> <strong>{staff.commissionRules.method}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Default Commission Rate</span> <strong>{staff.commissionRules.defaultRate}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Applicable Services</span> <strong>{staff.commissionRules.applicableServices}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Effective From</span> <strong>{staff.commissionRules.effectiveDate}</strong></div>
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No explicit commission rule configured yet. Default garage commission applies.</div>
                )}
              </div>
            )}

            {/* Commission Ledger & Earnings Summary */}
            {(staff.paymentType === 'Commission' || staff.paymentType === 'Salary + Commission') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>Commission Ledger & Earnings</div>
                <div style={{ backgroundColor: 'var(--surface-2)', padding: '12px', borderRadius: '10px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>September 2026 Commission Total</span>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--success)' }}>
                      {staff.name === 'Ajmal K' ? '₹2,000 (₹1,500 Approved)' : staff.name === 'Niyas P' ? '₹550 (₹550 Approved)' : '₹1,000 (₹1,000 Approved)'}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', backgroundColor: 'var(--success-soft)', color: 'var(--success)' }}>
                    Ledger Linked
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Documents' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '700' }}>Employment Documents</span>
              <button style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Upload size={14} /> Upload Doc
              </button>
            </div>
            {staff.documents.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '12px 0' }}>No employment documents uploaded yet.</div>
            ) : (
              staff.documents.map((doc) => (
                <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'var(--surface-2)', borderRadius: '8px', fontSize: '12px' }}>
                  <span><strong>{doc.name}</strong> ({doc.type})</span>
                  <span style={{ color: 'var(--text-muted)' }}>{doc.uploadedDate}</span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'Activity History' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {staff.activityHistory.map((act) => (
              <div key={act.id} style={{ padding: '10px', backgroundColor: 'var(--surface-2)', borderRadius: '8px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{act.action}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{act.timestamp}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>By: {act.actor} | Prev: {act.oldValue} → New: {act.newValue}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
