import { USE_MOCK_API } from '../api/apiConfig';
import apiClient from '../api/apiClient';
import { getMockLeaveRequests, mockLeaveRequests } from '../mock/leave.mock';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));
const asList = (value) => Array.isArray(value) ? value : value?.results || [];

const countLeaveDays = (startDate, endDate, halfDay = false) => {
  if (halfDay) return 0.5;
  if (!startDate || !endDate) return 0;
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.max(1, Math.floor((end - start) / 86400000) + 1);
};

const normalizeRequest = (row = {}) => {
  const startDate = row.startDate ?? row.start_date ?? '';
  const endDate = row.endDate ?? row.end_date ?? startDate;
  const halfDay = Boolean(row.halfDay ?? row.half_day ?? false);
  return {
    ...row,
    id: row.id,
    // Historic leave type labels are not used to grant paid daily wages.
    type: 'Leave',
    leaveMode: row.leaveMode || (halfDay ? 'Half Day' : 'Full Day'),
    halfDaySession: row.halfDaySession || null,
    startDate,
    endDate,
    daysCount: Number(
      row.daysCount ?? row.days_count ?? countLeaveDays(startDate, endDate, halfDay),
    ),
    reason: row.reason || '—',
    attachment: row.attachment || null,
    status: row.status || 'Pending',
    managerNote: row.managerNote || row.manager_note || '',
    payType: 'Unpaid',
    isPaid: false,
    submittedAt: row.submittedAt || row.created_at || row.createdAt || null,
    canCancel: row.canCancel !== undefined
      ? Boolean(row.canCancel)
      : (row.status || 'Pending') === 'Pending',
  };
};

/** Compatibility only: there are no paid leave balances or type allocations. */
export const getLeaveBalances = async () => [{
  id: 'UNPAID',
  code: 'UNPAID',
  type: 'Leave',
  isPaid: false,
  isUnpaid: true,
  unlimited: true,
  allocated: null,
  available: null,
  used: 0,
  pending: 0,
  halfDayAllowed: true,
}];

export const getLeaveRequests = async () => {
  if (USE_MOCK_API) {
    await delay();
    return getMockLeaveRequests().map(normalizeRequest);
  }
  return asList(await apiClient.get('/leave/requests')).map(normalizeRequest);
};

export const applyLeaveRequest = async (leaveData) => {
  if (USE_MOCK_API) {
    await delay();
    const newRequest = normalizeRequest({
      id: `LV-${Date.now()}`,
      type: 'Leave',
      isPaid: false,
      ...leaveData,
      status: 'Pending',
      submittedAt: new Date().toISOString(),
      canCancel: true,
    });
    mockLeaveRequests.unshift(newRequest);
    return newRequest;
  }

  // No leaveType input: backend always stores new leave as Unpaid Leave.
  const payload = {
    startDate: leaveData.startDate,
    endDate: leaveData.endDate,
    halfDay: leaveData.leaveMode === 'Half Day',
    reason: leaveData.reason,
    attachment: leaveData.attachment || '',
  };

  return normalizeRequest(await apiClient.post('/leave/requests', payload));
};

export const cancelLeaveRequest = async (requestId) => {
  if (USE_MOCK_API) {
    await delay();
    const target = mockLeaveRequests.find((row) => row.id === requestId);
    if (target) {
      target.status = 'Cancelled';
      target.canCancel = false;
    }
    return target ? normalizeRequest(target) : null;
  }
  return normalizeRequest(await apiClient.post(`/leave/requests/${requestId}/cancel`));
};

export const leaveService = {
  getLeaveBalances,
  getLeaveRequests,
  applyLeaveRequest,
  cancelLeaveRequest,
};
