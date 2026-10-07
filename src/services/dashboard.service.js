import { USE_MOCK_API } from '../api/apiConfig';
import { API_ENDPOINTS } from '../api/endpoints';
import apiClient from '../api/apiClient';
import { getMockDashboard, toggleMockClockIn } from '../mock/dashboard.mock';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const getDashboardData = async (params) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(getMockDashboard());
  }
  return apiClient.get(API_ENDPOINTS.DASHBOARD, { params });
};

export const toggleClockIn = async (action) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(toggleMockClockIn(action === 'check_in' ? 'CLOCKED_IN' : 'CLOCKED_OUT'));
  }
  return apiClient.post('/attendance/toggle', { action, source: 'web' });
};

export const dashboardService = {
  getDashboardData,
  getStats: getDashboardData,
  toggleClockIn
};
