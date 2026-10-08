import React, { useEffect, useState } from 'react';
import {
  ApplyLeaveForm,
  LeaveBalanceGrid,
  LeavePageHeader,
  LeaveRequestRecords,
} from '../../components/my-attendance';
import { ResponsiveModalSheet } from '../../components/common/ResponsiveModalSheet';
import { leaveService } from '../../services/leave.service';
import '../../styles/attendance-leave.css';

const createInitialForm = (leaveType = 'Casual Leave') => ({
  leaveType,
  leaveMode: 'Full Day',
  halfDaySession: 'First Half',
  startDate: '',
  endDate: '',
  reason: '',
  attachment: null,
});

export const LeaveRequests = () => {
  const [balances, setBalances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplySheet, setShowApplySheet] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(createInitialForm());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [balanceData, requestData] = await Promise.all([
        leaveService.getLeaveBalances(),
        leaveService.getLeaveRequests(),
      ]);

      const nextBalances = Array.isArray(balanceData) ? balanceData : [];
      setBalances(nextBalances);
      setRequests(Array.isArray(requestData) ? requestData : []);

      if (nextBalances.length) {
        setForm((current) => ({
          ...current,
          leaveType:
            nextBalances.some((item) => item.type === current.leaveType)
              ? current.leaveType
              : nextBalances[0].type,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openApply = () => {
    const defaultType = balances[0]?.type || 'Casual Leave';
    setForm(createInitialForm(defaultType));
    setShowApplySheet(true);
  };

  const closeApply = () => {
    if (submitting) return;
    setShowApplySheet(false);
  };

  const handleApplyLeave = async (event) => {
    event.preventDefault();

    if (!form.startDate || !form.reason.trim()) return;

    setSubmitting(true);
    try {
      await leaveService.applyLeaveRequest({
        type: form.leaveType,
        leaveMode: form.leaveMode,
        halfDaySession:
          form.leaveMode === 'Half Day' ? form.halfDaySession : null,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason.trim(),
        attachment: form.attachment?.name || '',
      });

      setShowApplySheet(false);
      await fetchData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (id) => {
    await leaveService.cancelLeaveRequest(id);
    await fetchData();
  };

  return (
    <div className="attendance-leave-dashboard">
      <LeavePageHeader onApply={openApply} />

      {loading ? (
        <div className="leave-page-loading">Loading leave information…</div>
      ) : (
        <>
          <LeaveBalanceGrid balances={balances} />
          <LeaveRequestRecords
            requests={requests}
            onCancel={handleCancelRequest}
          />
        </>
      )}

      <ResponsiveModalSheet
        isOpen={showApplySheet}
        onClose={closeApply}
        title="Apply for Leave"
        maxWidth="620px"
      >
        <ApplyLeaveForm
          balances={balances}
          form={form}
          setForm={setForm}
          submitting={submitting}
          onSubmit={handleApplyLeave}
          onCancel={closeApply}
        />
      </ResponsiveModalSheet>
    </div>
  );
};
