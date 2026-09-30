import apiClient from '../api/apiClient';
import { USE_MOCK_API } from '../api/apiConfig';

const clone = (value) => JSON.parse(JSON.stringify(value));
const wait = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

const readStore = (storageKey, seed = []) => {
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem(storageKey);
    }
  }
  localStorage.setItem(storageKey, JSON.stringify(seed));
  return clone(seed);
};

const writeStore = (storageKey, rows) => {
  localStorage.setItem(storageKey, JSON.stringify(rows));
  return clone(rows);
};

const makeId = (prefix = 'REC') => {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${stamp}-${random}`;
};

export const normalizeResourceList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  return [];
};

export const createResourceService = ({ endpoint, storageKey, seed = [], idPrefix = 'REC' }) => ({
  async list(params = {}) {
    if (!USE_MOCK_API) {
      const response = await apiClient.get(endpoint, { params });
      return normalizeResourceList(response);
    }

    await wait();
    const rows = readStore(storageKey, seed);
    const query = String(params.search || '').trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) =>
      Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(query))
    );
  },

  async get(id) {
    if (!USE_MOCK_API) return apiClient.get(`${endpoint}/${id}`);
    await wait();
    return readStore(storageKey, seed).find((row) => String(row.id) === String(id)) || null;
  },

  async create(payload) {
    if (!USE_MOCK_API) return apiClient.post(endpoint, payload);
    await wait();
    const rows = readStore(storageKey, seed);
    const record = { id: makeId(idPrefix), ...payload, createdAt: new Date().toISOString() };
    writeStore(storageKey, [record, ...rows]);
    return clone(record);
  },

  async update(id, payload) {
    if (!USE_MOCK_API) return apiClient.put(`${endpoint}/${id}`, payload);
    await wait();
    const rows = readStore(storageKey, seed);
    const next = rows.map((row) =>
      String(row.id) === String(id)
        ? { ...row, ...payload, updatedAt: new Date().toISOString() }
        : row
    );
    writeStore(storageKey, next);
    return clone(next.find((row) => String(row.id) === String(id)) || null);
  },

  async remove(id) {
    if (!USE_MOCK_API) return apiClient.delete(`${endpoint}/${id}`);
    await wait();
    const rows = readStore(storageKey, seed);
    writeStore(storageKey, rows.filter((row) => String(row.id) !== String(id)));
    return true;
  }
});
