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

const getBrowserLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator?.geolocation) {
      reject(new Error('Location is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      }),
      () => reject(new Error('Location permission is required for attendance.')),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });

export const toggleClockIn = async (action, options = {}) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(toggleMockClockIn(action === 'check_in' ? 'CLOCKED_IN' : 'CLOCKED_OUT'));
  }

  let location = {};
  if (options.locationRequired) {
    location = await getBrowserLocation();
  }

  return apiClient.post('/attendance/toggle', {
    action,
    source: 'web',
    location,
  });
};

export const dashboardService = {
  getDashboardData,
  getStats: getDashboardData,
  toggleClockIn
};
