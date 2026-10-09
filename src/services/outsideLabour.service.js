import apiClient from '../api/apiClient';
import { USE_MOCK_API } from '../api/apiConfig';

const requireBackend = () => {
  if (USE_MOCK_API) {
    throw new Error('Outside Labour uses actual workshop records. Set VITE_USE_MOCK_API=false and connect Django.');
  }
};

const asList = (value) => Array.isArray(value) ? value : value?.results || [];

export const outsideLabourService = {
  list: async (params = {}) => {
    requireBackend();
    return asList(await apiClient.get('/outside-labour', { params }));
  },
  create: async (payload) => {
    requireBackend();
    return apiClient.post('/outside-labour', payload);
  },
  update: async (id, payload) => {
    requireBackend();
    return apiClient.patch(`/outside-labour/${id}`, payload);
  },
  remove: async (id) => {
    requireBackend();
    return apiClient.delete(`/outside-labour/${id}`);
  },
  markPaid: async (id, payload) => {
    requireBackend();
    return apiClient.post(`/outside-labour/${id}/pay`, payload);
  },
  summary: async (params = {}) => {
    requireBackend();
    return apiClient.get('/outside-labour/summary', { params });
  },
};
