import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  StaffDirectoryCard,
  StaffDirectoryToolbar,
} from '../../components/staff-management';
import { getEmployeeLabel } from '../../components/staff-management/staffDisplay';
import { EmployeePayConfigurationSheet } from '../../components/payroll/EmployeePayConfigurationSheet';
import { payrollService } from '../../services/payroll.service';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';
import { staffService } from '../../services/staff.service';

export const Staff = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canViewPayroll = hasPermission(user, 'payroll.view');
  const canManagePayroll = hasPermission(user, 'payroll.edit');
  const canEditStaff = hasPermission(user, 'staff.edit');
  const [staffList, setStaffList] = useState([]);
  const [payPlans, setPayPlans] = useState([]);
  const [payTarget, setPayTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [error, setError] = useState('');

  const loadStaff = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await staffService.getStaff();
      setStaffList(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load staff.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const loadPayPlans = async () => {
    if (!canViewPayroll && !canManagePayroll) return;
    try {
      const plans = await payrollService.getSalaryStructures();
      setPayPlans(Array.isArray(plans) ? plans : plans?.results || []);
    } catch (error) {
      console.error('Unable to load staff pay types', error);
      setPayPlans([]);
    }
  };

  useEffect(() => {
    loadPayPlans();
  }, [canViewPayroll, canManagePayroll]);

  const currentPlans = useMemo(() => {
    const date = new Date();
    const today = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const plans = [...payPlans]
      .filter((plan) => {
        const from = plan.effectiveDate || plan.effective_from || '';
        const through = plan.effectiveTo || plan.effective_to || '';
        return (!from || from <= today) && (!through || through >= today) && plan.isActive !== false;
      })
      .sort((a, b) => String(b.effectiveDate || '').localeCompare(String(a.effectiveDate || '')));
    return new Map(plans.map((plan) => [String(plan.staffId || plan.employee), plan]).reverse());
  }, [payPlans]);

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();

    return staffList.filter((item, index) => {
      const matchesSearch =
        !query ||
        [
          item.name,
          item.designation,
          item.role,
          item.department,
          getEmployeeLabel(item, index),
          item.employeeId,
        ].some((value) =>
          String(value || '').toLowerCase().includes(query),
        );

      const matchesBranch =
        selectedBranch === 'All' || item.branch === selectedBranch;

      const matchesStatus =
        selectedStatus === 'All' || item.employmentStatus === selectedStatus;

      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [staffList, search, selectedBranch, selectedStatus]);

  const handleSavePay = async (payload) => {
    if (!canManagePayroll || !payTarget) return;
    await payrollService.saveSalaryStructure({
      ...payload,
      employee: payTarget.id,
      staffId: payTarget.id,
      staffName: payTarget.name,
    });
    setPayTarget(null);
    await loadPayPlans();
  };

  const handleToggleStatus = async (id) => {
    try {
      await staffService.toggleAccountStatus(id);
      await loadStaff();
    } catch (requestError) {
      setError(requestError?.message || 'Unable to update staff status.');
    }
  };

  return (
    <div className="staff-directory">
      <StaffDirectoryToolbar
        query={search}
        onQueryChange={setSearch}
        branch={selectedBranch}
        onBranchChange={setSelectedBranch}
        status={selectedStatus}
        onStatusChange={setSelectedStatus}
        onAdd={() => navigate('/staff-management/add')}
      />

      {error && <div className="staff-directory-message is-error">{error}</div>}

      {loading ? (
        <div className="staff-workshop-empty">Loading staff…</div>
      ) : filteredStaff.length ? (
        <div className="staff-card-grid">
          {filteredStaff.map((staff, index) => (
            <StaffDirectoryCard
              key={staff.id}
              staff={staff}
              index={index}
              onOpen={() => navigate(`/staff-management/staff/${staff.id}`)}
              onToggleStatus={canEditStaff ? () => handleToggleStatus(staff.id) : undefined}
              payPlan={currentPlans.get(String(staff.id))}
              canViewPay={canViewPayroll || canManagePayroll}
              onConfigurePay={canManagePayroll ? () => setPayTarget(staff) : undefined}
              onOpenWages={canViewPayroll ? () => navigate(`/staff/${staff.id}/wages`) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="staff-workshop-empty">No staff matched your filters.</div>
      )}

      {canManagePayroll && payTarget && (
        <EmployeePayConfigurationSheet
          isOpen={Boolean(payTarget)}
          onClose={() => setPayTarget(null)}
          structure={{
            ...(currentPlans.get(String(payTarget.id)) || {}),
            paymentType: currentPlans.get(String(payTarget.id))?.paymentType || payTarget.paymentType || 'monthly',
            staffId: payTarget.id,
            staffName: payTarget.name,
            employee: payTarget,
          }}
          onSave={handleSavePay}
        />
      )}
    </div>
  );
};
