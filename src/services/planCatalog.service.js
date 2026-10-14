import apiClient from '../api/apiClient';
import { USE_MOCK_API } from '../api/apiConfig';

export const planCatalogService = {
  list: () => USE_MOCK_API ? Promise.resolve([]) : apiClient.get('/saas/plans'),
  access: () => USE_MOCK_API ? Promise.resolve({ configured: false, features: {}, limits: {} }) : apiClient.get('/saas/plan-access'),
  changes: () => USE_MOCK_API ? Promise.resolve([]) : apiClient.get('/saas/billing/change-requests'),
  requestChange: (payload) => USE_MOCK_API
    ? Promise.reject(new Error('Connect to Django to send a plan request.'))
    : apiClient.post('/saas/billing/change-requests', payload),
  requestCustom: (payload) => USE_MOCK_API
    ? Promise.reject(new Error('Connect to Django to send a custom-plan request.'))
    : apiClient.post('/saas/billing/custom-requests', payload)
};
