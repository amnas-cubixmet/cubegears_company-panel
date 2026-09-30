import { USE_MOCK_API } from '../api/apiConfig';
import { API_ENDPOINTS } from '../api/endpoints';
import apiClient from '../api/apiClient';
import { getMockReports } from '../mock/reports.mock';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const getReports = async (params) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(getMockReports());
  }
  return apiClient.get(API_ENDPOINTS.REPORTS, { params });
};

export const getSalesReport = async (params) => getReports(params).then(r => r.salesSummary);
export const getStockReport = async (params) => getReports(params).then(r => r.stockSummary);
export const getEmployeeReport = async (params) => getReports(params).then(r => r.employeeEfficiency);

export const reportService = {
  getReports,
  getSalesReport,
  getStockReport,
  getEmployeeReport
};
