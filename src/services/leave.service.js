import { USE_MOCK_API } from '../api/apiConfig';
import { API_ENDPOINTS } from '../api/endpoints';
import apiClient from '../api/apiClient';
import { getMockLeaveBalances, getMockLeaveRequests, mockLeaveRequests } from '../mock/leave.mock';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const getLeaveBalances = async () => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(getMockLeaveBalances());
  }
  return apiClient.get('/api/leave/balances');
};

export const getLeaveRequests = async () => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(getMockLeaveRequests());
  }
  return apiClient.get('/api/leave/requests');
};

export const applyLeaveRequest = async (leaveData) => {
  if (USE_MOCK_API) {
    await delay();
    const newReq = {
      id: `LV-2026-${Math.floor(100 + Math.random() * 900)}`,
      ...leaveData,
      status: 'Pending',
      submittedAt: new Date().toISOString(),
      canCancel: true
    };
    mockLeaveRequests.unshift(newReq);
    return Promise.resolve(newReq);
  }
  return apiClient.post('/api/leave/requests', leaveData);
};

export const cancelLeaveRequest = async (requestId) => {
  if (USE_MOCK_API) {
    await delay();
    const target = mockLeaveRequests.find(r => r.id === requestId);
    if (target) {
      target.status = 'Cancelled';
      target.canCancel = false;
    }
    return Promise.resolve(target);
  }
  return apiClient.post(`/api/leave/requests/${requestId}/cancel`);
};

export const leaveService = {
  getLeaveBalances,
  getLeaveRequests,
  applyLeaveRequest,
  cancelLeaveRequest
};
