import axios from 'axios';
import { API_CONFIG } from './apiConfig';

export const apiClient = axios.create(API_CONFIG);

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

      if (window.location.pathname !== '/login') {
        const next = encodeURIComponent(
          `${window.location.pathname}${window.location.search}`
        );
        window.location.replace(`/login?next=${next}`);
      }
    }

    const payload = error?.response?.data;
    if (payload instanceof Error) return Promise.reject(payload);

    const message =
      payload?.message ||
      payload?.error ||
      error?.message ||
      'Something went wrong. Please try again.';

    const normalized = new Error(message);
    normalized.status = status;
    normalized.data = payload;

    return Promise.reject(normalized);
  }
);

export default apiClient;
