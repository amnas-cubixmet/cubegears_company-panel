import React, { useState, useEffect } from 'react';
import { payrollService } from '../../services/payroll.service';
import { usePayrollPeriod } from '../../context/PayrollPeriodContext';
import { PayrollPeriodFilter } from '../../components/payroll/PayrollPeriodFilter';
import { PayrollTabRail } from '../../components/staff-management/PayrollTabRail';
import { PayrollCard } from '../../components/staff-management/PayrollCard';
import { RecordPaymentSheet } from '../../components/staff-management/RecordPaymentSheet';
import { EditSalaryStructureSheet } from '../../components/staff-management/EditSalaryStructureSheet';
import { AdvanceCard } from '../../components/staff-management/AdvanceCard';
import { CreateAdvanceSheet } from '../../components/staff-management/CreateAdvanceSheet';
import { RecordRecoverySheet } from '../../components/staff-management/RecordRecoverySheet';
import { RecoveryHistoryModal } from '../../components/staff-management/RecoveryHistoryModal';
import { OvertimeManager } from '../../components/payroll/OvertimeManager';
import { CommissionManager } from '../../components/payroll/CommissionManager';
import { ResponsiveModalSheet } from '../../components/common/ResponsiveModalSheet';
import { DollarSign, CheckCircle2, AlertCircle, Clock, CreditCard, FileText, Plus, Filter, Printer, ShieldCheck } from 'lucide-react';

export const Payroll = ({ section = 'dashboard' }) => {
  const activeSection = section;
  const { selectedMonth, selectedYear, selectedBranch, selectedStaff, periodString } = usePayrollPeriod();

  const [payrolls, setPayrolls] = useState([]);
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  // Local Filter Overrides
  const [selectedApproval, setSelectedApproval] = useState('All');
  const [selectedSettlement, setSelectedSettlement] = useState('All');
  const [selectedSalaryBasis, setSelectedSalaryBasis] = useState('All');

  // Sheet & Modal Item States
  const [paymentTargetItem, setPaymentTargetItem] = useState(null);
  const [payslipTargetItem, setPayslipTargetItem] = useState(null);
  const [historyTargetItem, setHistoryTargetItem] = useState(null);
  const [detailTargetItem, setDetailTargetItem] = useState(null);
  const [structureEditTarget, setStructureEditTarget] = useState(null);
  const [advanceCreateOpen, setAdvanceCreateOpen] = useState(false);
  const [recoveryTargetItem, setRecoveryTargetItem] = useState(null);
  const [recoveryHistoryTargetItem, setRecoveryHistoryTargetItem] = useState(null);

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear, selectedBranch, selectedStaff, selectedApproval, selectedSettlement]);

  const loadData = async () => {
    setLoading(true);
    try {
      const pData = await payrollService.getPayrolls({
        month: periodString,
        branch: selectedBranch,
        staffId: selectedStaff,
        approvalStatus: selectedApproval,
        paymentStatus: selectedSettlement
      });
      const sData = await payrollService.getSalaryStructures();
      const aData = await payrollService.getSalaryAdvances();
      setPayrolls(pData);
      setSalaryStructures(sData);
      setAdvances(aData);
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

  const handleUpdateApproval = async (id, status) => {
    await payrollService.updateApprovalStatus(id, status);
    showToast(`Payroll status updated to ${status}.`);
    loadData();
  };

  const handleRecordPaymentSave = async (payrollId, paymentData) => {
    await payrollService.recordPayment(payrollId, paymentData);
    showToast('Salary payment recorded successfully.');
    loadData();
  };

  const handleSaveSalaryStructure = async (structureData) => {
    await payrollService.saveSalaryStructure(structureData);
    showToast('Salary structure updated successfully.');
    loadData();
  };

  const handleCreateAdvanceSave = async (advanceData) => {
    await payrollService.createSalaryAdvance(advanceData);
    setAdvanceCreateOpen(false);
    showToast('Salary advance created successfully.');
    loadData();
  };

  const handleRecordRecoverySave = async (advanceId, recoveryData) => {
    try {
      await payrollService.recordAdvanceRecovery(advanceId, recoveryData);
      setRecoveryTargetItem(null);
      showToast('Advance recovery recorded successfully.');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to record recovery.');
    }
  };

  // Dashboard Aggregates
  const totalGross = payrolls.reduce((acc, curr) => acc + (curr.grossSalary || (curr.baseSalary + curr.allowances + (curr.overtimePay || 0))), 0);
  const totalNet = payrolls.reduce((acc, curr) => acc + curr.netSalary, 0);
  const totalApprovedOtPay = payrolls.reduce((acc, curr) => acc + (curr.overtimePay || 0), 0);
  const pendingApprovalCount = payrolls.filter((p) => p.approvalStatus !== 'Approved').length;
  const approvedCount = payrolls.filter((p) => p.approvalStatus === 'Approved').length;
  const totalPaid = payrolls.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);
  const outstandingSalary = totalNet - totalPaid;

  const unpaidStaff = payrolls.filter((p) => p.paymentStatus === 'Unpaid').length;
  const partialStaff = payrolls.filter((p) => p.paymentStatus === 'Partially Paid').length;
  const paidStaff = payrolls.filter((p) => p.paymentStatus === 'Paid').length;

  const filteredSalaryStructures = selectedSalaryBasis === 'All'
    ? salaryStructures
    : salaryStructures.filter((item) => item.salaryBasis === selectedSalaryBasis);

  const salaryPrimaryValue = (structure) => {
    if (structure.salaryBasis === 'Hourly') return `${formatINR(structure.hourlyRate)} / hour`;
    if (structure.salaryBasis === 'Daily') return `${formatINR(structure.dailyRate)} / day`;
    if (structure.salaryBasis === 'Commission Only') return 'Approved commission';
    return `${formatINR(structure.fixedMonthlySalary ?? structure.basicSalary)} / month`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* Toast Feedback Banner */}
      {toastMsg && (
        <div style={{ backgroundColor: 'var(--success)', color: '#ffffff', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          {toastMsg}
        </div>
      )}

      {/* Internal Horizontally Scrollable Payroll Submenu Rail */}
      <PayrollTabRail />

      {/* Global Shared Payroll Period Filter Toolbar */}
      <PayrollPeriodFilter />

      {/* Section 1: Dashboard */}
      {activeSection === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Summary KPI Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', width: '100%' }}>
            <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '12px 14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Gross Payroll</div>
              <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>{formatINR(totalGross)}</div>
            </div>
            <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '12px 14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Net Payroll</div>
              <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--primary)', marginTop: '2px' }}>{formatINR(totalNet)}</div>
            </div>
            <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '12px 14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Approved OT Pay</div>
              <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--primary)', marginTop: '2px' }}>{formatINR(totalApprovedOtPay)}</div>
            </div>
            <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '12px 14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Paid Amount</div>
              <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--success)', marginTop: '2px' }}>{formatINR(totalPaid)}</div>
            </div>
            <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '12px 14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Outstanding Salary</div>
              <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--danger)', marginTop: '2px' }}>{formatINR(outstandingSalary)}</div>
            </div>
          </div>

          {/* Settlement Staff Counts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', padding: '12px', borderRadius: '14px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Unpaid Staff</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--danger)' }}>{unpaidStaff}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Partially Paid</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--warning)' }}>{partialStaff}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Paid Staff</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--success)' }}>{paidStaff}</div>
            </div>
          </div>

          {/* Quick Filters */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              style={{ height: '40px', padding: '0 12px', borderRadius: '10px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px' }}
            >
              <option value="All">All Branches</option>
              <option value="Main Garage Branch">Main Garage Branch</option>
              <option value="Kochi South Branch">Kochi South Branch</option>
            </select>
          </div>

          {/* Payroll Cards List */}
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Loading records for {periodString}...
            </div>
          ) : payrolls.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-muted)', fontSize: '14px' }}>
              No payroll records found for {periodString}.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px', width: '100%' }}>
              {payrolls.map((p) => (
                <PayrollCard
                  key={p.id}
                  payroll={p}
                  onRecordPayment={(item) => setPaymentTargetItem(item)}
                  onViewDetails={(item) => setDetailTargetItem(item)}
                  onViewPayslip={(item) => setPayslipTargetItem(item)}
                  onViewHistory={(item) => setHistoryTargetItem(item)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section 2: Salary Structure */}
      {activeSection === 'salary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            padding: '12px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '14px'
          }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>Staff Salary Configurations</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Fixed monthly, hourly, daily or commission salary can be set per employee.</div>
            </div>
            <select
              value={selectedSalaryBasis}
              onChange={(e) => setSelectedSalaryBasis(e.target.value)}
              style={{
                minWidth: '170px',
                height: '38px',
                padding: '0 10px',
                borderRadius: '9px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface-2)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              <option value="All">All Salary Types</option>
              <option value="Fixed Monthly">Fixed Monthly</option>
              <option value="Hourly">Per Hour</option>
              <option value="Daily">Per Day</option>
              <option value="Commission Only">Commission Only</option>
            </select>
          </div>

          {filteredSalaryStructures.length === 0 ? (
            <div style={{
              padding: '28px',
              textAlign: 'center',
              backgroundColor: 'var(--surface)',
              border: '1px dashed var(--border)',
              borderRadius: '14px',
              color: 'var(--text-muted)',
              fontSize: '13px'
            }}>
              No salary structures found for this salary type.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {filteredSalaryStructures.map((s) => (
                <div key={s.id} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>{s.staffName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.effectiveDate ? `Effective ${s.effectiveDate}` : 'Active salary structure'}</div>
                    </div>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '999px',
                      backgroundColor: 'var(--primary-soft)',
                      color: 'var(--primary)',
                      fontSize: '10px',
                      fontWeight: '800',
                      whiteSpace: 'nowrap'
                    }}>{s.salaryBasis}</span>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '11px', backgroundColor: 'var(--surface-2)' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Primary Pay</div>
                    <div style={{ marginTop: '3px', fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{salaryPrimaryValue(s)}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '6px', fontSize: '12px' }}>
                    <div style={{ padding: '8px', borderRadius: '9px', border: '1px solid var(--border)' }}>Allowances<br/><strong>{formatINR(s.allowances)}</strong></div>
                    <div style={{ padding: '8px', borderRadius: '9px', border: '1px solid var(--border)' }}>Incentives<br/><strong>{formatINR(s.fixedIncentives)}</strong></div>
                  </div>

                  <button
                    onClick={() => setStructureEditTarget(s)}
                    style={{ width: '100%', minHeight: '38px', borderRadius: '9px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--primary)', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Edit Salary Structure
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section 3: Monthly Payroll */}
      {activeSection === 'monthly' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>
            Monthly Payroll Calculation ({periodString})
          </div>

          {/* Overtime & Commission Review Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '14px', backgroundColor: 'var(--surface-2)' }}>
              <OvertimeManager />
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '14px', backgroundColor: 'var(--surface-2)' }}>
              <CommissionManager />
            </div>
          </div>

          <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '8px' }}>
            Calculated Monthly Payroll Records
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
            {payrolls.map((p) => (
              <PayrollCard
                key={p.id}
                payroll={p}
                onRecordPayment={(item) => setPaymentTargetItem(item)}
                onViewDetails={(item) => setDetailTargetItem(item)}
                onViewPayslip={(item) => setPayslipTargetItem(item)}
                onViewHistory={(item) => setHistoryTargetItem(item)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Payroll Approvals */}
      {activeSection === 'approvals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '16px', fontWeight: '700' }}>Payroll Approvals Workflow</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
            {payrolls.map((p) => (
              <div key={p.id} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '15px', fontWeight: '700' }}>{p.staffName}</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', backgroundColor: 'var(--warning-soft)', color: 'var(--warning)' }}>{p.approvalStatus}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Net Salary: <strong>{formatINR(p.netSalary)}</strong></div>
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                  {p.approvalStatus !== 'Approved' && (
                    <button
                      onClick={() => handleUpdateApproval(p.id, 'Approved')}
                      style={{ flex: 1, height: '36px', borderRadius: '8px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Approve Payroll
                    </button>
                  )}
                  {p.approvalStatus !== 'Rejected' && (
                    <button
                      onClick={() => handleUpdateApproval(p.id, 'Rejected')}
                      style={{ flex: 1, height: '36px', borderRadius: '8px', backgroundColor: 'var(--danger-soft)', color: 'var(--danger)', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 5: Disbursal */}
      {activeSection === 'disbursal' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '16px', fontWeight: '700' }}>Salary Disbursal & Payments</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
            {payrolls.map((p) => (
              <PayrollCard
                key={p.id}
                payroll={p}
                onRecordPayment={(item) => setPaymentTargetItem(item)}
                onViewDetails={(item) => setDetailTargetItem(item)}
                onViewPayslip={(item) => setPayslipTargetItem(item)}
                onViewHistory={(item) => setHistoryTargetItem(item)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Section 6: Advances & Recovery */}
      {activeSection === 'advances' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="advance-page-header">
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Salary Advances & Recovery Ledger
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Track salary advances, scheduled recovery and outstanding balance.
              </p>
            </div>
            <button
              type="button"
              className="create-advance-btn"
              onClick={() => setAdvanceCreateOpen(true)}
              style={{
                borderRadius: '10px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '0 16px'
              }}
            >
              <Plus size={16} /> Create Advance
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px', width: '100%' }}>
            {advances.map((a) => (
              <AdvanceCard
                key={a.id}
                advance={a}
                onRecordRecovery={(item) => setRecoveryTargetItem(item)}
                onViewDetails={(item) => setRecoveryHistoryTargetItem(item)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Section 7: Payslips */}
      {activeSection === 'payslips' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '16px', fontWeight: '700' }}>Employee Payslips</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {payrolls.map((p) => (
              <div key={p.id} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '700' }}>{p.staffName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.month} • {p.designation}</div>
                </div>
                <button
                  onClick={() => setPayslipTargetItem(p)}
                  style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <FileText size={14} /> View Payslip
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 8: Payroll Reports */}
      {activeSection === 'reports' && (
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '16px', fontWeight: '700' }}>Payroll Summary Reports</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            <div style={{ backgroundColor: 'var(--surface-2)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Obligations</div>
              <div style={{ fontSize: '16px', fontWeight: '800' }}>{formatINR(totalNet)}</div>
            </div>
            <div style={{ backgroundColor: 'var(--surface-2)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Settlements</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--success)' }}>{formatINR(totalPaid)}</div>
            </div>
            <div style={{ backgroundColor: 'var(--surface-2)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Outstanding Balance</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--danger)' }}>{formatINR(outstandingSalary)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Record Salary Payment Sheet Modal */}
      <RecordPaymentSheet
        isOpen={!!paymentTargetItem}
        onClose={() => setPaymentTargetItem(null)}
        payroll={paymentTargetItem}
        onSave={handleRecordPaymentSave}
      />

      {/* Edit Salary Structure Sheet Modal */}
      <EditSalaryStructureSheet
        isOpen={!!structureEditTarget}
        onClose={() => setStructureEditTarget(null)}
        structure={structureEditTarget}
        onSave={handleSaveSalaryStructure}
      />

      {/* Payslip View Modal */}
      {payslipTargetItem && (
        <ResponsiveModalSheet
          isOpen={!!payslipTargetItem}
          onClose={() => setPayslipTargetItem(null)}
          title="Employee Payslip"
          maxWidth="520px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>CubeGears Garage Services</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Payslip for {payslipTargetItem.month}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px', fontSize: '13px' }}>
              <div>Staff Name: <strong>{payslipTargetItem.staffName}</strong></div>
              <div>Staff ID: <strong>{payslipTargetItem.staffId}</strong></div>
              <div>Designation: <strong>{payslipTargetItem.designation}</strong></div>
              <div>Branch: <strong>{payslipTargetItem.branch}</strong></div>
            </div>

            <div style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>Earnings & Deductions</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Basic Salary</span><span>{formatINR(payslipTargetItem.baseSalary)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Allowances</span><span>{formatINR(payslipTargetItem.allowances)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)' }}><span>Approved Overtime ({payslipTargetItem.overtimeHours || '0h'})</span><span>+{formatINR(payslipTargetItem.overtimePay)}</span></div>
              {payslipTargetItem.incentives > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}><span>Fixed Incentives</span><span>+{formatINR(payslipTargetItem.incentives)}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)' }}><span>Advance Recovery / Deductions</span><span>-{formatINR((payslipTargetItem.deductions || 0) + (payslipTargetItem.advanceRecovery || 0))}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', color: 'var(--primary)', borderTop: '1px solid var(--border)', paddingTop: '6px', marginTop: '4px' }}>
                <span>Net Salary</span>
                <span>{formatINR(payslipTargetItem.netSalary)}</span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              style={{ width: '100%', height: '44px', borderRadius: '10px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Printer size={16} /> Print / Download PDF Payslip
            </button>
          </div>
        </ResponsiveModalSheet>
      )}

      {/* Payment History View Modal */}
      {historyTargetItem && (
        <ResponsiveModalSheet
          isOpen={!!historyTargetItem}
          onClose={() => setHistoryTargetItem(null)}
          title={`Payment History: ${historyTargetItem.staffName}`}
          maxWidth="520px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {historyTargetItem.payments?.length === 0 ? (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No payment transactions recorded yet.</div>
            ) : (
              historyTargetItem.payments.map((pmt) => (
                <div key={pmt.id} style={{ backgroundColor: 'var(--surface-2)', padding: '12px', borderRadius: '10px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                    <span>{formatINR(pmt.amount)} ({pmt.method})</span>
                    <span style={{ color: 'var(--success)' }}>{pmt.transferStatus}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Date: {pmt.date} | Ref: {pmt.reference} | By: {pmt.recordedBy}
                  </div>
                  {pmt.remarks && <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Note: {pmt.remarks}</div>}
                </div>
              ))
            )}
          </div>
        </ResponsiveModalSheet>
      )}

      {/* Payroll Details View Modal */}
      {detailTargetItem && (
        <ResponsiveModalSheet
          isOpen={!!detailTargetItem}
          onClose={() => setDetailTargetItem(null)}
          title={`Payroll Details: ${detailTargetItem.staffName}`}
          maxWidth="560px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px', backgroundColor: 'var(--surface-2)', padding: '12px', borderRadius: '10px' }}>
              <div>Base Salary: <strong>{formatINR(detailTargetItem.baseSalary)}</strong></div>
              <div>Allowances: <strong>{formatINR(detailTargetItem.allowances)}</strong></div>
              <div>Overtime Pay: <strong style={{ color: 'var(--success)' }}>+{formatINR(detailTargetItem.overtimePay)}</strong></div>
              <div>Incentives: <strong style={{ color: 'var(--success)' }}>+{formatINR(detailTargetItem.incentives)}</strong></div>
              <div>Deductions: <strong style={{ color: 'var(--danger)' }}>-{formatINR(detailTargetItem.deductions)}</strong></div>
              <div>Advance Recovery: <strong style={{ color: 'var(--danger)' }}>-{formatINR(detailTargetItem.advanceRecovery)}</strong></div>
            </div>

            <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--primary)' }}>
              Net Salary: {formatINR(detailTargetItem.netSalary)}
            </div>
          </div>
        </ResponsiveModalSheet>
      )}

      {/* Create Salary Advance Sheet Modal */}
      <CreateAdvanceSheet
        isOpen={advanceCreateOpen}
        onClose={() => setAdvanceCreateOpen(false)}
        onSave={handleCreateAdvanceSave}
      />

      {/* Record Advance Recovery Sheet Modal */}
      <RecordRecoverySheet
        isOpen={!!recoveryTargetItem}
        onClose={() => setRecoveryTargetItem(null)}
        advance={recoveryTargetItem}
        onSave={handleRecordRecoverySave}
      />

      {/* Recovery History & Details Modal */}
      <RecoveryHistoryModal
        isOpen={!!recoveryHistoryTargetItem}
        onClose={() => setRecoveryHistoryTargetItem(null)}
        advance={recoveryHistoryTargetItem}
      />
    </div>
  );
};
