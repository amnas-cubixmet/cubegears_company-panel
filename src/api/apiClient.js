import axios from 'axios';
import { API_CONFIG } from './apiConfig';

export const apiClient = axios.create(API_CONFIG);

let refreshPromise = null;

const clearAuth = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_refresh_token');
  localStorage.removeItem('auth_user');
};

const redirectToLogin = () => {
  if (window.location.pathname === '/login') return;

  const next = encodeURIComponent(
    `${window.location.pathname}${window.location.search}`
  );
  window.location.replace(`/login?next=${next}`);
};

const refreshAccessToken = async () => {
  const refresh = localStorage.getItem('auth_refresh_token');
  if (!refresh) throw new Error('No refresh token available.');

  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${API_CONFIG.baseURL}/auth/refresh`,
        { refresh },
        {
          timeout: API_CONFIG.timeout,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )
      .then(({ data }) => {
        const access = data?.access;
        if (!access) throw new Error('Token refresh did not return an access token.');

        localStorage.setItem('auth_token', access);

        if (data?.refresh) {
          localStorage.setItem('auth_refresh_token', data.refresh);
        }

        return access;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

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
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config;
    const isAuthRequest =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh');

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._cubixgearRetried &&
      !isAuthRequest &&
      localStorage.getItem('auth_refresh_token')
    ) {
      originalRequest._cubixgearRetried = true;

      try {
        const access = await refreshAccessToken();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${access}`;

        const response = await apiClient.request(originalRequest);
        return response;
      } catch {
        clearAuth();
        redirectToLogin();
      }
    } else if (status === 401) {
      clearAuth();
      redirectToLogin();
    }

    const payload = error?.response?.data;
    if (payload instanceof Error) return Promise.reject(payload);

    const fieldErrors = {};

    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      Object.entries(payload).forEach(([key, value]) => {
        if (['message', 'error', 'detail'].includes(key)) return;

        if (Array.isArray(value)) {
          fieldErrors[key] = value.map(String).filter(Boolean).join(' ');
        } else if (typeof value === 'string') {
          fieldErrors[key] = value;
        }
      });
    }

    const firstFieldError = Object.values(fieldErrors)[0] || null;

    const message =
      payload?.message ||
      payload?.error ||
      payload?.detail ||
      fieldErrors.non_field_errors ||
      firstFieldError ||
      error?.message ||
      'Something went wrong. Please try again.';

    const normalized = new Error(message);
    normalized.status = status;
    normalized.data = payload;
    normalized.fieldErrors = fieldErrors;

    return Promise.reject(normalized);
  }
);

export default apiClient;
