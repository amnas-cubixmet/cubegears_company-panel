import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getDefaultAuthorizedRoute, getSafePostLoginDestination } from '../src/utils/authorizedLanding.js';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const mechanic = { role: { code: 'MECHANIC', permissions: ['jobs.view', 'attendance.self'] } };
const owner = { role: { code: 'SUPER_ADMIN', permissions: ['*'] } };

test('login landing is the first authorized route, not always dashboard', () => {
  assert.equal(getDefaultAuthorizedRoute(mechanic), '/jobs');
  assert.equal(getDefaultAuthorizedRoute(owner), '/dashboard');
  assert.equal(getDefaultAuthorizedRoute(null), '/access-denied');
});

test('post-login next route must be internal and permitted', () => {
  assert.equal(getSafePostLoginDestination('/jobs/123/inspection?tab=details', mechanic), '/jobs/123/inspection?tab=details');
  assert.equal(getSafePostLoginDestination('/payroll/daily-wages', mechanic), '/jobs');
  assert.equal(getSafePostLoginDestination('https://malicious.example', owner), '/dashboard');
  assert.equal(getSafePostLoginDestination('//malicious.example', owner), '/dashboard');
  assert.equal(getSafePostLoginDestination('/login', owner), '/dashboard');
  assert.equal(getSafePostLoginDestination('/unregistered-path', mechanic), '/jobs');
});

test('router landing and login use authorized profile', () => {
  assert.match(read('src/routes/AppRoutes.jsx'), /getDefaultAuthorizedRoute\(user\)/);
  assert.match(read('src/pages/auth/Login.jsx'), /getSafePostLoginDestination\(params\.get\('next'\), signedInUser\)/);
});

test('live login verifies tenant profile before showing protected app', () => {
  const auth = read('src/context/AuthContext.jsx');
  assert.match(auth, /await apiClient\.get\('\/auth\/me'\)/);
  assert.match(auth, /profile\?\.company\?\.id/);
  assert.match(auth, /Array\.isArray\(profile\.role\.permissions\)/);
  assert.match(auth, /setIsAuthenticated\(false\)/);
});
