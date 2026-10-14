import apiClient from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

export const authService = {
  login: async (credentials) => {
    return await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
  },
  forgotPassword: async (data) => {
    return await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
  },
  resetPassword: async (data) => {
    return await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, data);
  },
  getProfile: async () => {
    return await apiClient.get(ENDPOINTS.AUTH.ME);
  }
};
