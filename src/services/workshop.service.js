import { USE_MOCK_API } from '../api/apiConfig';
import { API_ENDPOINTS } from '../api/endpoints';
import apiClient from '../api/apiClient';
import { getMockServices, addMockService } from '../mock/services.mock';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const getServices = async (params) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(getMockServices());
  }
  return apiClient.get(API_ENDPOINTS.SERVICES, { params });
};

export const createService = async (data) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(addMockService(data));
  }
  return apiClient.post(API_ENDPOINTS.SERVICES, data);
};

export const workshopService = {
  getServices,
  createService,
  getAll: getServices,
  create: createService
};

export const serviceService = workshopService;
