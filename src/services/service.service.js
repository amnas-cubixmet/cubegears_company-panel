import apiClient from '../api/apiClient';
import { USE_MOCK_API } from '../api/apiConfig';
import {
  getMockCategories,
  addMockCategory,
  addMockServiceType,
  getMockServices,
  addMockService,
  getMockServiceById,
  updateMockService,
  deleteMockService,
  updateMockCategory,
  deleteMockCategory
} from '../mock/services.mock';

const delay = (ms = 160) => new Promise((resolve) => setTimeout(resolve, ms));

export const getServiceCategories = async () => {
  if (USE_MOCK_API) { await delay(); return getMockCategories(); }
  return apiClient.get('/services/categories');
};

export const createServiceCategory = async (data) => {
  if (USE_MOCK_API) { await delay(); return addMockCategory(data); }
  return apiClient.post('/services/categories', data);
};

export const updateServiceCategory = async (id, data) => {
  if (USE_MOCK_API) { await delay(); return updateMockCategory(id, data); }
  return apiClient.put(`/services/categories/${id}`, data);
};

export const deleteServiceCategory = async (id) => {
  if (USE_MOCK_API) { await delay(); return deleteMockCategory(id); }
  return apiClient.delete(`/services/categories/${id}`);
};

export const createServiceType = async (categoryId, typeData) => {
  if (USE_MOCK_API) { await delay(); return addMockServiceType(categoryId, typeData); }
  return apiClient.post(`/services/categories/${categoryId}/types`, typeData);
};

export const getServices = async (params = {}) => {
  if (USE_MOCK_API) { await delay(); return getMockServices(); }
  return apiClient.get('/services', { params });
};

export const getServiceById = async (id) => {
  if (USE_MOCK_API) { await delay(); return getMockServiceById(id); }
  return apiClient.get(`/services/${id}`);
};

export const createService = async (data) => {
  if (USE_MOCK_API) { await delay(); return addMockService(data); }
  return apiClient.post('/services', data);
};

export const updateService = async (id, data) => {
  if (USE_MOCK_API) { await delay(); return updateMockService(id, data); }
  return apiClient.put(`/services/${id}`, data);
};

export const deleteService = async (id) => {
  if (USE_MOCK_API) { await delay(); return deleteMockService(id); }
  return apiClient.delete(`/services/${id}`);
};

export const serviceService = {
  getServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  createServiceType,
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
};
