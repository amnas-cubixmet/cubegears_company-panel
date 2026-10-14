import apiClient from '../api/apiClient';
import { normalizeEmail } from '../utils/validation';

// Legacy consumers use the same real workshop API as AuthContext.
export const authService = {
  login: (credentials) =>
    apiClient.post('/auth/login', { ...credentials, email: normalizeEmail(credentials?.email) }),
  forgotPassword: (data) =>
    apiClient.post('/auth/forgot-password', { ...data, email: normalizeEmail(data?.email) }),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),
  getProfile: () => apiClient.get('/auth/me'),
};
