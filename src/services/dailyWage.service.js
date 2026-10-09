import apiClient from '../api/apiClient';
import { USE_MOCK_API } from '../api/apiConfig';

const BASE = '/payroll/daily-wages/';

const active = () => {
  if (USE_MOCK_API) throw new Error('Daily Wages requires the connected Django backend. Set VITE_USE_MOCK_API=false.');
};

export const dailyWageService = {
  dashboard: (params = {}) => { active(); return apiClient.get(BASE, { params }); },
  account: (employeeId) => { active(); return apiClient.get(`${BASE}employees/${employeeId}`); },
  history: (params = {}) => { active(); return apiClient.get(`${BASE}history`, { params }); },
  payments: (params = {}) => { active(); return apiClient.get(`${BASE}payments`, { params }); },
  addRate: (employeeId, form) => { active(); return apiClient.post(`${BASE}employees/${employeeId}/rates`, form); },
  finalizeAttendance: (employeeId, form) => { active(); return apiClient.post(`${BASE}employees/${employeeId}/finalize`, form); },
  addExtra: (employeeId, form) => { active(); return apiClient.post(`${BASE}employees/${employeeId}/extras`, form); },
  reviewExtra: (extraId, status) => { active(); return apiClient.post(`${BASE}extras/${extraId}/approve`, { status }); },
  adjustment: (employeeId, form) => { active(); return apiClient.post(`${BASE}employees/${employeeId}/adjustments`, form); },
  pay: (employeeId, form) => { active(); return apiClient.post(`${BASE}employees/${employeeId}/pay`, form); },
  reverse: (paymentId, reason) => { active(); return apiClient.post(`${BASE}payments/${paymentId}/reverse`, { reason }); },
};
