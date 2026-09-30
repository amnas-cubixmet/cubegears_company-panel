import React, { useState, useEffect } from 'react';
import { Plus, Edit, X } from 'lucide-react';
import { attendanceManagerService } from '../../services/attendanceManager.service';

export const LeaveTypes = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddLeaveTypeOpen, setIsAddLeaveTypeOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Form fields state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'Paid',
    allocationMethod: 'Fixed Annual Allocation',
    annualAllocation: '12',
    halfDay: true,
    carryForward: '5 Days',
    maxCarryForward: '5',
    expiryRule: 'End of Calendar Year',
    eligibility: 'All Permanent Staff',
    status: 'Active'
  });

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  // Lock background scroll when modal/bottom-sheet is open
  useEffect(() => {
    if (isAddLeaveTypeOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAddLeaveTypeOpen]);

  const fetchLeaveTypes = async () => {
    setLoading(true);
    try {
      const data = await attendanceManagerService.getLeaveTypes();
      setTypes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSaveLeaveType = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    setSaving(true);
    try {
      await attendanceManagerService.createLeaveType({
        ...formData,
        allocation: `${formData.annualAllocation} Days / Year`
      });
      setIsAddLeaveTypeOpen(false);
      setToastMsg('Leave type added successfully.');
      setTimeout(() => setToastMsg(''), 3000);
      fetchLeaveTypes();
      setFormData({
        name: '',
        code: '',
        type: 'Paid',
        allocationMethod: 'Fixed Annual Allocation',
        annualAllocation: '12',
        halfDay: true,
        carryForward: '5 Days',
        maxCarryForward: '5',
        expiryRule: 'End of Calendar Year',
        eligibility: 'All Permanent Staff',
        status: 'Active'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* Toast notification */}
      {toastMsg && (
        <div style={{
          backgroundColor: 'var(--success)',
          color: '#ffffff',
          padding: '10px 14px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {toastMsg}
        </div>
      )}

      {/* Header layout */}
      <div className="leave-type-header" style={{
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ width: '100%' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, lineHeight: 1.25 }}>
            Company Leave Types
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.5, width: '100%', maxWidth: '100%' }}>
            Manage leave policies, annual accruals, carry-forward, expiry and half-day rules.
          </p>
        </div>

        <button
          type="button"
          className="add-leave-type-btn"
          onClick={() => setIsAddLeaveTypeOpen(true)}
          style={{
            height: '46px',
            padding: '0 16px',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            borderRadius: '10px',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            border: 'none',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          <Plus size={16} /> Add Leave Type
        </button>
      </div>

      {/* Grid of configured leave types */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', width: '100%' }}>
        {types.map(t => (
          <div key={t.id} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{t.name}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>({t.code})</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', backgroundColor: 'var(--success-soft)', color: 'var(--success)' }}>
                {t.status.toUpperCase()}
              </span>
            </div>

            <div style={{ backgroundColor: 'var(--surface-2)', padding: '10px', borderRadius: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Type:</span> <strong>{t.type}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Allocation:</span> <strong>{t.allocation}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Half Day:</span> <strong>{t.halfDay ? 'Allowed' : 'No'}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Carry Fwd:</span> <strong>{t.carryForward}</strong></div>
            </div>

            <button style={{ height: '34px', borderRadius: '8px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Edit size={13} /> Edit Config
            </button>
          </div>
        ))}
      </div>

      {/* Responsive Add Leave Type Overlay (Desktop Centered Modal / Mobile Bottom Sheet) */}
      {isAddLeaveTypeOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddLeaveTypeOpen(false);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 99999,
            display: 'flex',
            boxSizing: 'border-box'
          }}
          className="leave-type-overlay"
        >
          <div
            className="leave-type-modal-sheet"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Drag Handle Indicator for Mobile */}
            <div className="mobile-drag-handle" style={{ display: 'flex', justifyContent: 'center', paddingTop: '8px', paddingBottom: '4px' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '2px', backgroundColor: 'var(--border)' }} />
            </div>

            {/* Sticky Header */}
            <div style={{
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              padding: '14px 20px',
              borderBottom: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                Add New Leave Type
              </h3>
              <button
                type="button"
                onClick={() => setIsAddLeaveTypeOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div style={{
              padding: '16px 20px',
              overflowY: 'auto',
              flex: 1
            }} className="scroll-hidden">
              <form id="add-leave-type-form" onSubmit={handleSaveLeaveType} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-row-2col" style={{ display: 'grid', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Leave Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g. Casual Leave"
                      style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', boxSizing: 'border-box', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Leave Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      placeholder="e.g. CL"
                      style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', boxSizing: 'border-box', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div className="form-row-2col" style={{ display: 'grid', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Paid / Unpaid *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', boxSizing: 'border-box', fontSize: '13px' }}
                    >
                      <option value="Paid">Paid Leave</option>
                      <option value="Unpaid">Unpaid Leave</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Allocation Method *
                    </label>
                    <select
                      value={formData.allocationMethod}
                      onChange={(e) => handleInputChange('allocationMethod', e.target.value)}
                      style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', boxSizing: 'border-box', fontSize: '13px' }}
                    >
                      <option value="Fixed Annual Allocation">Fixed Annual Allocation</option>
                      <option value="Monthly Accrual">Monthly Accrual</option>
                      <option value="Manual Adjustment Only">Manual Adjustment Only</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-2col" style={{ display: 'grid', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Annual Allocation (Days)
                    </label>
                    <input
                      type="number"
                      value={formData.annualAllocation}
                      onChange={(e) => handleInputChange('annualAllocation', e.target.value)}
                      style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', boxSizing: 'border-box', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Max Carry Forward (Days)
                    </label>
                    <input
                      type="number"
                      value={formData.maxCarryForward}
                      onChange={(e) => handleInputChange('maxCarryForward', e.target.value)}
                      style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', boxSizing: 'border-box', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div className="form-row-2col" style={{ display: 'grid', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Expiry Rule
                    </label>
                    <input
                      type="text"
                      value={formData.expiryRule}
                      onChange={(e) => handleInputChange('expiryRule', e.target.value)}
                      placeholder="e.g. End of Year"
                      style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', boxSizing: 'border-box', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Staff Eligibility
                    </label>
                    <input
                      type="text"
                      value={formData.eligibility}
                      onChange={(e) => handleInputChange('eligibility', e.target.value)}
                      placeholder="e.g. All Staff"
                      style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', boxSizing: 'border-box', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', paddingTop: '4px' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.halfDay}
                      onChange={(e) => handleInputChange('halfDay', e.target.checked)}
                    />
                    Half-Day Allowed
                  </label>

                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.status === 'Active'}
                      onChange={(e) => handleInputChange('status', e.target.checked ? 'Active' : 'Inactive')}
                    />
                    Active Status
                  </label>
                </div>
              </form>
            </div>

            {/* Sticky Action Footer */}
            <div style={{
              padding: '14px 20px',
              paddingBottom: 'calc(14px + env(safe-area-inset-bottom))',
              borderTop: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              display: 'flex',
              gap: '12px',
              position: 'sticky',
              bottom: 0,
              zIndex: 10
            }}>
              <button
                type="button"
                onClick={() => setIsAddLeaveTypeOpen(false)}
                style={{
                  flex: 1,
                  height: '46px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-leave-type-form"
                disabled={saving}
                style={{
                  flex: 1,
                  height: '46px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {saving ? 'Saving...' : 'Save Leave Type'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
