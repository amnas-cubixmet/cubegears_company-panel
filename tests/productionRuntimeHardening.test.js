import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { hasPermission, getUserPermissions } from '../src/utils/permissions.js';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('permission hook passes authenticated user, not role', () => {
  assert.match(read('src/hooks/usePermission.js'), /hasPermission\(user, requiredPermission\)/);
  const role = { code: 'TECHNICIAN', permissions: ['jobs.view'] };
  const user = { role };
  assert.equal(hasPermission(user, 'jobs.view'), true);
  assert.equal(hasPermission(user, 'payroll.view'), false);
  assert.equal(hasPermission(role, 'jobs.view'), false);
});

test('Django effective permissions override browser role permissions', () => {
  const user = { role: { code: 'STAFF', permissions: ['*'] }, effectivePermissions: ['jobs.view', 'attendance.self'] };
  assert.deepEqual(getUserPermissions(user), ['jobs.view', 'attendance.self']);
  assert.equal(hasPermission(user, 'jobs.view'), true);
  assert.equal(hasPermission(user, 'payroll.view'), false);
  assert.equal(hasPermission(null, 'jobs.view'), false);
});

test('company identity follows signed-in tenant and cannot be overwritten locally', () => {
  const source = read('src/context/CompanyContext.jsx');
  assert.match(source, /USE_MOCK_API \? DEMO_COMPANY : \(user\?\.company \|\| null\)/);
  assert.match(source, /value\?\.id === authenticatedCompany\.id/);
  assert.match(source, /setLocalCompany\(null\)/);
});

test('public auth 401 responses remain on forms instead of forcing login', () => {
  const source = read('src/api/apiClient.js');
  assert.match(source, /!isPublicAuthUrl\(config\.url\)/);
  assert.match(source, /!isPublicAuthRequest &&/);
  assert.match(source, /status === 401 && !isPublicAuthRequest/);
});

test('auth service uses valid Django URLs through shared api client', () => {
  const source = read('src/services/auth.service.js');
  assert.match(source, /\.\.\/api\/apiClient/);
  for (const path of ['/auth/login', '/auth/me', '/auth/forgot-password', '/auth/reset-password']) {
    assert.ok(source.includes(path), path);
  }
  assert.doesNotMatch(source, /ENDPOINTS\.AUTH/);
});
