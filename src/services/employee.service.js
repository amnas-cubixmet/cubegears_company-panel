import { USE_MOCK_API } from '../api/apiConfig';
import { API_ENDPOINTS } from '../api/endpoints';
import apiClient from '../api/apiClient';
import { getMockEmployees, getMockEmployeeById, addMockEmployee } from '../mock/employees.mock';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const getEmployees = async (params) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(getMockEmployees());
  }
  return apiClient.get(API_ENDPOINTS.EMPLOYEES, { params });
};

export const getEmployeeById = async (id) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(getMockEmployeeById(id));
  }
  return apiClient.get(`${API_ENDPOINTS.EMPLOYEES}/${id}`);
};

export const createEmployee = async (data) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(addMockEmployee(data));
  }
  return apiClient.post(API_ENDPOINTS.EMPLOYEES, data);
};

export const employeeService = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  getAll: getEmployees,
  getById: getEmployeeById,
  create: createEmployee
};
