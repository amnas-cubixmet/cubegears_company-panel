import React, { useEffect, useState } from 'react';
import {
  ApplyLeaveForm,
  LeavePageHeader,
  LeaveRequestRecords,
} from '../../components/my-attendance';
import { ResponsiveModalSheet } from '../../components/common/ResponsiveModalSheet';
import { leaveService } from '../../services/leave.service';
import '../../styles/attendance-leave.css';

const createInitialForm = () => ({
  leaveMode: 'Full Day',
  halfDaySession: 'First Half',
  startDate: '',
  endDate: '',
  reason: '',
  attachment: null,
});

export const LeaveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplySheet, setShowApplySheet] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(createInitialForm());
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const requestData = await leaveService.getLeaveRequests();
      setRequests(Array.isArray(requestData) ? requestData : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openApply = () => {
    setError('');
    setForm(createInitialForm());
    setShowApplySheet(true);
  };

  const closeApply = () => {
    if (submitting) return;
    setError('');
    setShowApplySheet(false);
  };

  const handleApplyLeave = async (event) => {
    event.preventDefault();

    if (!form.startDate || !form.reason.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      await leaveService.applyLeaveRequest({
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
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        'Unable to submit leave request.';
      setError(message);
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
      <LeavePageHeader onApply={openApply} disabled={loading} />

      {error && !showApplySheet && (
        <div className="leave-page-error">{error}</div>
      )}

      {loading ? (
        <div className="leave-page-loading">Loading leave information…</div>
      ) : (
        <>
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
        {error && <div className="leave-page-error">{error}</div>}
        <ApplyLeaveForm
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
