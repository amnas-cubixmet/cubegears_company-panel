const configuredBaseUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  '';

const explicitMockMode = import.meta.env.VITE_USE_MOCK_API;
const requestedMockMode =
  explicitMockMode == null
    ? null
    : String(explicitMockMode).toLowerCase() === 'true';

/*
 * CubixGear runtime mode:
 * - If no backend URL exists, always use mock/demo data so Vercel previews
 *   and frontend-only deployments never try localhost and show Network Error.
 * - Once VITE_API_URL is configured, set VITE_USE_MOCK_API=false to use
 *   the real backend.
 * - Local development still defaults to mock mode unless explicitly disabled
 *   with a valid API URL.
 */
export const USE_MOCK_API =
  !configuredBaseUrl ||
  requestedMockMode === true ||
  (requestedMockMode == null && import.meta.env.DEV);

if (import.meta.env.PROD && !configuredBaseUrl) {
  console.info('[CubixGear] No VITE_API_URL configured; running in frontend demo/mock mode.');
}

export const API_CONFIG = {
  baseURL: configuredBaseUrl || '/api/v1',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT || 15000),
  withCredentials: String(import.meta.env.VITE_API_WITH_CREDENTIALS || 'false') === 'true',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
};
