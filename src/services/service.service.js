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

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';
const delay = (ms = 160) => new Promise((resolve) => setTimeout(resolve, ms));

export const getServiceCategories = async () => {
  if (USE_MOCK) {
    await delay();
    return getMockCategories();
  }
  return [];
};

export const createServiceCategory = async (data) => {
  if (USE_MOCK) {
    await delay();
    return addMockCategory(data);
  }
  return null;
};

export const updateServiceCategory = async (id, data) => {
  if (USE_MOCK) {
    await delay();
    return updateMockCategory(id, data);
  }
  return null;
};

export const deleteServiceCategory = async (id) => {
  if (USE_MOCK) {
    await delay();
    return deleteMockCategory(id);
  }
  return false;
};

export const createServiceType = async (categoryId, typeData) => {
  if (USE_MOCK) {
    await delay();
    return addMockServiceType(categoryId, typeData);
  }
  return null;
};

export const getServices = async () => {
  if (USE_MOCK) {
    await delay();
    return getMockServices();
  }
  return [];
};

export const getServiceById = async (id) => {
  if (USE_MOCK) {
    await delay();
    return getMockServiceById(id);
  }
  return null;
};

export const createService = async (data) => {
  if (USE_MOCK) {
    await delay();
    return addMockService(data);
  }
  return null;
};

export const updateService = async (id, data) => {
  if (USE_MOCK) {
    await delay();
    return updateMockService(id, data);
  }
  return null;
};

export const deleteService = async (id) => {
  if (USE_MOCK) {
    await delay();
    return deleteMockService(id);
  }
  return false;
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
