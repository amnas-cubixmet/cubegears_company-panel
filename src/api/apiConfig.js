const explicitMockMode = import.meta.env.VITE_USE_MOCK_API;

export const USE_MOCK_API =
  explicitMockMode == null
    ? import.meta.env.DEV
    : String(explicitMockMode).toLowerCase() === 'true';

const configuredBaseUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  '';

if (!USE_MOCK_API && !configuredBaseUrl && import.meta.env.PROD) {
  console.error('[CubixGear] Production API URL is not configured. Set VITE_API_URL.');
}

export const API_CONFIG = {
  baseURL: configuredBaseUrl || 'http://localhost:5000/api/v1',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT || 15000),
  withCredentials: String(import.meta.env.VITE_API_WITH_CREDENTIALS || 'false') === 'true',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
};
