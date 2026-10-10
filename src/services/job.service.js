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
  const response = await apiClient.get(API_ENDPOINTS.JOBS, { params });
  return Array.isArray(response) ? response : response?.results || [];
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
  // Job workspace saves individual sections, not a complete replacement resource.
  return apiClient.patch(`${API_ENDPOINTS.JOBS}/${id}`, data);
};

const WORKFLOW_STAGES = ['overview', 'inspection', 'estimate', 'work', 'qc', 'invoice'];
const STATUS_PROGRESS = {
  New: 0, Inspection: 1, 'Estimate Pending': 2,
  Approved: 3, 'In Progress': 3, 'Waiting for Parts': 3,
  QC: 4, 'Ready for Delivery': 5, Delivered: 6
};
const NEXT_STATUS = {
  overview: 'Inspection', inspection: 'Estimate Pending',
  estimate: 'In Progress', work: 'QC',
  qc: 'Ready for Delivery', invoice: 'Delivered'
};

const mockWorkflow = (job) => {
  const completed = WORKFLOW_STAGES.slice(0, STATUS_PROGRESS[job?.status] || 0);
  const current = WORKFLOW_STAGES.find((stage) => !completed.includes(stage)) || 'invoice';
  return {
    current,
    completed,
    locked: WORKFLOW_STAGES.slice(WORKFLOW_STAGES.indexOf(current) + 1),
    stages: WORKFLOW_STAGES,
    finished: completed.length === WORKFLOW_STAGES.length
  };
};

export const getJobWorkflow = async (id) => {
  if (USE_MOCK_API) return mockWorkflow(await getJobById(id));
  return apiClient.get(`${API_ENDPOINTS.JOBS}/${id}/workflow`);
};

export const completeJobStage = async (id, stage, options = {}) => {
  if (USE_MOCK_API) {
    const updated = await updateJobStatus(id, NEXT_STATUS[stage]);
    return { ...mockWorkflow(updated), job: updated };
  }
  return apiClient.post(`${API_ENDPOINTS.JOBS}/${id}/workflow`, { stage, ...options });
};

export const createJobEstimate = async (id, payload) => {
  if (USE_MOCK_API) throw new Error('Use existing mock estimate workflow in demo mode.');
  return apiClient.post(`${API_ENDPOINTS.JOBS}/${id}/estimates`, payload);
};

export const rejectJobEstimate = async (id, estimateId) => {
  if (USE_MOCK_API) throw new Error('Use existing mock estimate workflow in demo mode.');
  return apiClient.post(`${API_ENDPOINTS.JOBS}/${id}/estimates/${estimateId}/decision`, { decision: 'Rejected' });
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
  getJobWorkflow,
  completeJobStage,
  createJobEstimate,
  rejectJobEstimate,
  deleteJob,
  getVehicleHistory,
  getAll: getJobs,
  getById: getJobById,
  create: createJob
};
