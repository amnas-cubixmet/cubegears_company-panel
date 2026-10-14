import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isValidEmail, normalizeEmail } from '../src/utils/validation.js';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('valid common emails are accepted and normalized', () => {
  for (const email of [
    'admin@gmail.com',
    'hello@company.in',
    'first.last+tag@sub.example.co.in',
    ' USER@EXAMPLE.COM ',
  ]) {
    assert.equal(isValidEmail(email), true, email);
  }
  assert.equal(normalizeEmail('  USER+TAG@Example.COM  '), 'user+tag@example.com');
});

test('malformed emails and empty values are rejected', () => {
  for (const email of ['', '  ', null, 'admin', 'admin@', '@company.com', 'a b@company.com', 'a@localhost', 'admin@company..com', 'admin@.com', 'admin@company.com.']) {
    assert.equal(isValidEmail(email), false, String(email));
  }
  assert.equal(isValidEmail('a'.repeat(250) + '@example.com'), false);
});

test('every custom email validator reuses the same validated rule', () => {
  for (const path of [
    'src/pages/auth/Login.jsx',
    'src/pages/auth/ForgotPassword.jsx',
    'src/pages/staff-management/StaffAddPage.jsx',
    'src/components/account/companyAccountValidation.js',
    'src/services/authRecovery.service.js',
  ]) {
    const source = read(path);
    assert.match(source, /isValidEmail\(/, path);
    assert.doesNotMatch(source, /\\\\s@/, path);
  }
  assert.match(read('src/pages/staff-management/StaffAddPage.jsx'), /email,\s*department:/);
});

test('login and recovery requests must not send stale tokens or redirect on expected 401 errors', () => {
  const client = read('src/api/apiClient.js');
  assert.match(client, /token && !isPublicAuthRequest\(config\.url\)/);
  assert.match(client, /status === 401 && !isAuthRequest/);
  assert.match(client, /forgot-password\|reset-password\|setup-password/);
});
