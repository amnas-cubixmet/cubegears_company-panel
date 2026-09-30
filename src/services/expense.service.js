import { USE_MOCK_API } from '../api/apiConfig';
import { API_ENDPOINTS } from '../api/endpoints';
import apiClient from '../api/apiClient';
import {
  getMockExpenses,
  addMockExpense,
  getMockExpenseById,
  updateMockExpense,
  deleteMockExpense
} from '../mock/expenses.mock';

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export const getExpenses = async (params) => {
  if (USE_MOCK_API) {
    await delay();
    let rows = getMockExpenses();
    const q = String(params?.search || '').trim().toLowerCase();
    if (q) {
      rows = rows.filter((expense) =>
        [
          expense.id,
          expense.title,
          expense.category,
          expense.vendor,
          expense.referenceNo,
          expense.paymentMethod
        ].some((value) => String(value || '').toLowerCase().includes(q))
      );
    }
    return rows;
  }
  return apiClient.get(API_ENDPOINTS.EXPENSES, { params });
};

export const getExpenseById = async (id) => {
  if (USE_MOCK_API) {
    await delay();
    return getMockExpenseById(id);
  }
  return apiClient.get(`${API_ENDPOINTS.EXPENSES}/${id}`);
};

export const createExpense = async (data) => {
  if (USE_MOCK_API) {
    await delay();
    return addMockExpense(data);
  }
  return apiClient.post(API_ENDPOINTS.EXPENSES, data);
};

export const updateExpense = async (id, data) => {
  if (USE_MOCK_API) {
    await delay();
    return updateMockExpense(id, data);
  }
  return apiClient.put(`${API_ENDPOINTS.EXPENSES}/${id}`, data);
};

export const deleteExpense = async (id) => {
  if (USE_MOCK_API) {
    await delay();
    return deleteMockExpense(id);
  }
  return apiClient.delete(`${API_ENDPOINTS.EXPENSES}/${id}`);
};

export const expenseService = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getAll: getExpenses,
  getById: getExpenseById,
  create: createExpense,
  update: updateExpense,
  delete: deleteExpense
};
