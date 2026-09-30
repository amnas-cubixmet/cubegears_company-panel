import { USE_MOCK_API } from '../api/apiConfig';
import apiClient from '../api/apiClient';
import { getMockWebsite } from '../mock/website.mock';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const getWebsiteConfig = async () => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(getMockWebsite());
  }
  return apiClient.get('/website');
};

export const websiteService = {
  getWebsiteConfig
};
