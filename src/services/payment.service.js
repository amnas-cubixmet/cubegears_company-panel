import { USE_MOCK_API } from '../api/apiConfig';
import { API_ENDPOINTS } from '../api/endpoints';
import apiClient from '../api/apiClient';
import { getMockPayments, getMockPaymentById, addMockPayment } from '../mock/payments.mock';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const getPayments = async (params) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(getMockPayments());
  }
  return apiClient.get(API_ENDPOINTS.PAYMENTS, { params });
};

export const getPaymentById = async (id) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(getMockPaymentById(id));
  }
  return apiClient.get(`${API_ENDPOINTS.PAYMENTS}/${id}`);
};

export const createPayment = async (data) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(addMockPayment(data));
  }
  return apiClient.post(API_ENDPOINTS.PAYMENTS, data);
};

export const paymentService = {
  getPayments,
  getPaymentById,
  createPayment,
  getAll: getPayments,
  getById: getPaymentById
};
