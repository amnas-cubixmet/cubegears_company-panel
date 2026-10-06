import apiClient from '../api/apiClient';
import { USE_MOCK_API } from '../api/apiConfig';

const wait = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));
const RESET_KEY = 'cubixgear:mock-password-reset';
const MAGIC_KEY = 'cubixgear:mock-magic-link';

export const requestPasswordReset = async (email) => {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail) throw new Error('Email address is required.');

  if (USE_MOCK_API) {
    await wait();
    const token = `reset_${Date.now()}`;
    localStorage.setItem(RESET_KEY, JSON.stringify({ email: cleanEmail, token, createdAt: new Date().toISOString() }));
    return { ok: true, token, previewUrl: `/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(cleanEmail)}` };
  }

  return apiClient.post('/auth/forgot-password', { email: cleanEmail });
};

export const requestMagicLink = async (email) => {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail) throw new Error('Email address is required.');

  if (USE_MOCK_API) {
    await wait();
    const token = `magic_${Date.now()}`;
    localStorage.setItem(MAGIC_KEY, JSON.stringify({ email: cleanEmail, token, createdAt: new Date().toISOString() }));
    return { ok: true, token, previewUrl: `/magic-link/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(cleanEmail)}` };
  }

  return apiClient.post('/auth/magic-link', { email: cleanEmail });
};

export const setupPassword = async ({ uid, token, password }) => {
  if (!uid || !token) throw new Error('Setup link is invalid or incomplete.');
  if (!password || password.length < 8) throw new Error('Password must be at least 8 characters.');

  if (USE_MOCK_API) {
    await wait();
    return { ok: true };
  }

  return apiClient.post('/auth/setup-password', { uid, token, password });
};

export const resetPassword = async ({ token, email, password }) => {
  if (!password || password.length < 8) throw new Error('Password must be at least 8 characters.');

  if (USE_MOCK_API) {
    await wait();
    const saved = JSON.parse(localStorage.getItem(RESET_KEY) || '{}');
    if (!token || saved.token !== token) throw new Error('Reset link is invalid or expired.');
    localStorage.removeItem(RESET_KEY);
    localStorage.setItem('cubixgear:mock-password-updated', JSON.stringify({ email: email || saved.email, at: new Date().toISOString() }));
    return { ok: true };
  }

  return apiClient.post('/auth/reset-password', { token, email, password });
};

export const verifyMagicLink = async ({ token, email }) => {
  if (USE_MOCK_API) {
    await wait(250);
    const saved = JSON.parse(localStorage.getItem(MAGIC_KEY) || '{}');
    if (!token || saved.token !== token) throw new Error('Magic link is invalid or expired.');
    localStorage.removeItem(MAGIC_KEY);
    return {
      token: 'mock_magic_jwt_2026',
      user: { id: 'USR_101', name: 'Alex Rivera', email: email || saved.email || 'admin@cubixgear.com', role: 'SUPER_ADMIN' }
    };
  }

  return apiClient.post('/auth/magic-link/verify', { token, email });
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  if (!newPassword || newPassword.length < 8) throw new Error('New password must be at least 8 characters.');

  if (USE_MOCK_API) {
    await wait();
    if (!currentPassword) throw new Error('Current password is required.');
    localStorage.setItem('cubixgear:mock-password-updated', JSON.stringify({ at: new Date().toISOString() }));
    return { ok: true };
  }

  return apiClient.post('/auth/change-password', { currentPassword, newPassword });
};

export const authRecoveryService = {
  requestPasswordReset,
  requestMagicLink,
  setupPassword,
  resetPassword,
  verifyMagicLink,
  changePassword
};
