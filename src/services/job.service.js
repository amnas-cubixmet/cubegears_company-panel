import { USE_MOCK_API } from '../api/apiConfig';
import { API_ENDPOINTS } from '../api/endpoints';
import apiClient from '../api/apiClient';
import {
  getMockJobs,
  getMockJobById,
  addMockJob,
  updateMockJobStatus,
  updateMockJob,
  deleteMockJob
} from '../mock/jobs.mock';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const getJobs = async (params) => {
  if (USE_MOCK_API) {
    await delay();
    let result = getMockJobs();
    if (params?.status) {
      result = result.filter(j => j.status === params.status);
    }
    return Promise.resolve(result);
  }
  return apiClient.get(API_ENDPOINTS.JOBS, { params });
};

export const getJobById = async (id) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(getMockJobById(id));
  }
  return apiClient.get(`${API_ENDPOINTS.JOBS}/${id}`);
};

export const createJob = async (data) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(addMockJob(data));
  }
  return apiClient.post(API_ENDPOINTS.JOBS, data);
};

export const updateJobStatus = async (id, status) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(updateMockJobStatus(id, status));
  }
  return apiClient.patch(`${API_ENDPOINTS.JOBS}/${id}/status`, { status });
};

export const updateJob = async (id, data) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(updateMockJob(id, data));
  }
  return apiClient.put(`${API_ENDPOINTS.JOBS}/${id}`, data);
};

export const deleteJob = async (id) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(deleteMockJob(id));
  }
  return apiClient.delete(`${API_ENDPOINTS.JOBS}/${id}`);
};

export const getVehicleHistory = async (registration) => {
  const normalized = String(registration || '').replace(/\s+/g, '').toLowerCase();
  if (!normalized) return [];

  const jobs = await getJobs();
  return jobs
    .filter((job) => String(job.vehicleReg || '').replace(/\s+/g, '').toLowerCase() === normalized)
    .sort((a, b) => String(b.createdDate || '').localeCompare(String(a.createdDate || '')));
};

export const jobService = {
  getJobs,
  getJobById,
  createJob,
  updateJobStatus,
  updateJob,
  deleteJob,
  getVehicleHistory,
  getAll: getJobs,
  getById: getJobById,
  create: createJob
};
