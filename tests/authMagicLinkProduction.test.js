import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const verify = read('../src/pages/auth/MagicLinkVerify.jsx');
const login = read('../src/pages/auth/Login.jsx');
const forgot = read('../src/pages/auth/ForgotPassword.jsx');

test('magic link calls real API once, never recurses and reloads AuthContext', () => {
  assert.match(verify, /const verificationRequests = new Map\(\)/);
  assert.match(verify, /authRecoveryService\.verifyMagicLink\(\{ token, email \}\)/);
  assert.doesNotMatch(verify, /verificationRequests\.set\(\s*token,\s*verifyMagicLinkOnce/);
  assert.match(verify, /verifyMagicLinkOnce\(\{ token, email \}\)/);
  assert.match(verify, /window\.location\.replace\(destination\)/);
});

test('magic link never authorizes a missing company and restricts next path', () => {
  assert.match(verify, /!profile\?\.company\?\.id/);
  assert.match(verify, /getSafePostLoginDestination\(next, profile\)/);
  assert.match(verify, /window\.history\.replaceState/);
});

test('login page advertises passwordless email sign-in', () => {
  assert.match(login, /forgot-password\?mode=magic/);
  assert.match(login, /Email me a one-time sign-in link/);
  assert.match(forgot, /searchParams\.get\('mode'\) === 'magic'/);
});
