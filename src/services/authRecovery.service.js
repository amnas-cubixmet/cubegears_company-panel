import apiClient from '../api/apiClient';

// Account recovery must always be checked by Django's User database.
// Mock UI/data mode must never issue synthetic login or password reset tokens.
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

export const requestPasswordReset = async (email) => {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) throw new Error('Email address is required.');
  return apiClient.post('/auth/forgot-password', { email: cleanEmail });
};

export const requestMagicLink = async (email) => {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) throw new Error('Email address is required.');
  return apiClient.post('/auth/magic-link', { email: cleanEmail });
};

export const setupPassword = async ({ uid, token, password }) => {
  if (!uid || !token) throw new Error('Setup link is invalid or incomplete.');
  if (!password || password.length < 8) throw new Error('Password must be at least 8 characters.');
  return apiClient.post('/auth/setup-password', { uid, token, password });
};

export const resetPassword = async ({ uid, token, email, password }) => {
  if (!token || (!uid && !email)) throw new Error('Reset link is invalid or incomplete.');
  if (!password || password.length < 8) throw new Error('Password must be at least 8 characters.');
  const payload = { token, password };
  if (uid) payload.uid = uid;
  else payload.email = normalizeEmail(email);
  return apiClient.post('/auth/reset-password', payload);
};

export const verifyMagicLink = async ({ token, email }) => {
  if (!token) throw new Error('Magic link is invalid or incomplete.');
  return apiClient.post('/auth/magic-link/verify', { token, email: normalizeEmail(email) });
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  if (!newPassword || newPassword.length < 8) throw new Error('New password must be at least 8 characters.');
  return apiClient.post('/auth/change-password', { currentPassword, newPassword });
};

export const authRecoveryService = {
  requestPasswordReset,
  requestMagicLink,
  setupPassword,
  resetPassword,
  verifyMagicLink,
  changePassword,
};
