import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getDefaultAuthorizedRoute } from '../src/utils/authorizedLanding.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
test('setup verifies tenant and redirects by real staff permission', () => {
  const src = read('src/pages/auth/SetupPassword.jsx');
  assert.match(src, /getDefaultAuthorizedRoute\(user\)/);
  assert.match(src, /user\?\.company\?\.id/);
  assert.match(src, /Array\.isArray\(user\.role\.permissions\)/);
  assert.match(src, /window\.location\.replace\(nextDestination\)/);
  assert.doesNotMatch(src, /window\.location\.replace\('\/dashboard'\)/);
  assert.equal(getDefaultAuthorizedRoute({ role: { permissions: ['jobs.view'] } }), '/jobs');
});
test('staff creation limits protected role and confirms queued invite', () => {
  const src = read('src/pages/staff-management/StaffAddPage.jsx');
  assert.match(src, /!role\.isProtected/);
  assert.match(src, /form\.email\.trim\(\) && !form\.role/);
  assert.match(src, /created\?\.loginStatus === 'Password Setup Pending'/);
  assert.match(src, /password setup link/);
  assert.match(read('src/pages/staff-management/staff/StaffProfile.jsx'), /location\.state\?\.invitationQueued/);
});
