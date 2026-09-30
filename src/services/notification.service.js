import { USE_MOCK_API } from '../api/apiConfig';
import { API_ENDPOINTS } from '../api/endpoints';
import apiClient from '../api/apiClient';
import { getMockNotifications } from '../mock/notifications.mock';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const getNotifications = async () => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(getMockNotifications());
  }
  return apiClient.get(API_ENDPOINTS.NOTIFICATIONS);
};

export const notificationService = {
  getNotifications,
  getAll: getNotifications
};
