import { USE_MOCK_API } from '../api/apiConfig';
import { API_ENDPOINTS } from '../api/endpoints';
import apiClient from '../api/apiClient';
import { getMockInvoices, getMockInvoiceById, addMockInvoice } from '../mock/invoices.mock';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const getInvoices = async (params) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(getMockInvoices());
  }
  return apiClient.get(API_ENDPOINTS.INVOICES, { params });
};

export const getInvoiceById = async (id) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(getMockInvoiceById(id));
  }
  return apiClient.get(`${API_ENDPOINTS.INVOICES}/${id}`);
};

export const createInvoice = async (data) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(addMockInvoice(data));
  }
  return apiClient.post(API_ENDPOINTS.INVOICES, data);
};

export const invoiceService = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  getAll: getInvoices,
  getById: getInvoiceById,
  create: createInvoice
};
