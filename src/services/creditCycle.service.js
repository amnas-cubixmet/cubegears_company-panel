import apiClient from '../api/apiClient';

// Authoritative amounts and dates always come from Django. Never infer
// a debit from a browser-side storage estimate or "zero" wallet balance.
export const creditCycleService = {
  status: () => apiClient.get('/saas/credits/billing-cycle'),
  retry: () => apiClient.post('/saas/credits/billing-cycle', {}),
};
