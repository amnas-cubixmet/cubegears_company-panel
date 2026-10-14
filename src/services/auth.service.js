import apiClient from '../api/apiClient';

// Keep legacy auth callers on the real Django URLs and shared interceptors.
export const authService = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),
  getProfile: () => apiClient.get('/auth/me')
};
