import { USE_MOCK_API } from '../api/apiConfig';
import apiClient from '../api/apiClient';
import {
  getMockLeaveBalances,
  getMockLeaveRequests,
  mockLeaveRequests,
} from '../mock/leave.mock';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeBalance = (row = {}) => {
  const type = row.type || row.name || 'Leave';
  const isUnpaid =
    Boolean(row.isUnpaid ?? row.is_unpaid) ||
    String(row.paidType || row.paid_type || '').toLowerCase() === 'unpaid' ||
    String(type).trim().toLowerCase() === 'unpaid leave';

  return {
    ...row,
    id: row.id || row.code || type,
    type,
    isPaid: row.isPaid ?? row.is_paid ?? !isUnpaid,
    isUnpaid,
    unlimited: Boolean(row.unlimited || isUnpaid),
    allocated: isUnpaid ? null : Number(row.allocated ?? row.annualAllocation ?? 0),
    used: Number(row.used ?? 0),
    pending: Number(row.pending ?? 0),
    available: isUnpaid ? null : Number(row.available ?? row.remaining ?? 0),
    allocationPeriod:
      row.allocationPeriod ||
      row.allocation_period ||
      (isUnpaid ? 'none' : 'year'),
    allocationMethod:
      row.allocationMethod ||
      row.allocation_method ||
      (isUnpaid ? 'system' : 'annual'),
    paidType: isUnpaid ? 'Unpaid' : 'Paid',
    halfDayAllowed: row.halfDayAllowed ?? row.half_day_allowed ?? true,
  };
};

const ensureUnpaidLeave = (balances = []) => {
  const rows = balances.map(normalizeBalance);
  if (rows.some((row) => row.isUnpaid)) return rows;

  return [
    ...rows,
    normalizeBalance({
      id: 'UNPAID',
      code: 'UNPAID',
      type: 'Unpaid Leave',
      paidType: 'Unpaid',
      isPaid: false,
      isUnpaid: true,
      unlimited: true,
      used: 0,
      pending: 0,
      halfDayAllowed: true,
    }),
  ];
};

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
    type: row.type || row.leaveType || row.leave_type || 'Leave',
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
    payType:
      row.payType ||
      row.pay_type ||
      (String(row.leave_type || row.leaveType || row.type || '').trim().toLowerCase() === 'unpaid leave'
        ? 'Unpaid'
        : 'Paid'),
    isPaid:
      row.isPaid ??
      row.is_paid ??
      (String(row.leave_type || row.leaveType || row.type || '').trim().toLowerCase() !== 'unpaid leave'),
    submittedAt: row.submittedAt || row.created_at || row.createdAt || null,
    canCancel:
      row.canCancel !== undefined
        ? Boolean(row.canCancel)
        : (row.status || 'Pending') === 'Pending',
  };
};

const listFromResponse = (response) =>
  Array.isArray(response) ? response : response?.results || [];

export const getLeaveBalances = async () => {
  if (USE_MOCK_API) {
    await delay();
    return ensureUnpaidLeave(getMockLeaveBalances());
  }

  const response = await apiClient.get('/leave/balances');
  return ensureUnpaidLeave(listFromResponse(response));
};

export const getLeaveRequests = async () => {
  if (USE_MOCK_API) {
    await delay();
    return getMockLeaveRequests().map(normalizeRequest);
  }

  const response = await apiClient.get('/leave/requests');
  return listFromResponse(response).map(normalizeRequest);
};

export const applyLeaveRequest = async (leaveData) => {
  if (USE_MOCK_API) {
    await delay();
    const newReq = normalizeRequest({
      id: `LV-2026-${Math.floor(100 + Math.random() * 900)}`,
      ...leaveData,
      status: 'Pending',
      submittedAt: new Date().toISOString(),
      canCancel: true,
    });
    mockLeaveRequests.unshift(newReq);
    return newReq;
  }

  const payload = {
    leaveType: leaveData.type,
    startDate: leaveData.startDate,
    endDate: leaveData.endDate,
    halfDay: leaveData.leaveMode === 'Half Day',
    reason: leaveData.reason,
    attachment: leaveData.attachment || '',
  };

  const response = await apiClient.post('/leave/requests', payload);
  return normalizeRequest(response);
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

  const response = await apiClient.post(`/leave/requests/${requestId}/cancel`);
  return normalizeRequest(response);
};

export const leaveService = {
  getLeaveBalances,
  getLeaveRequests,
  applyLeaveRequest,
  cancelLeaveRequest,
};
