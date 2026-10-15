import test from 'node:test';
import assert from 'node:assert/strict';
import { getStaffLandingPath } from '../src/utils/staffLanding.js';
import { hasPermission, getUserPermissions } from '../src/utils/permissions.js';

test('signup owner lands on SaaS Account even with a requested deep link', () => {
  assert.equal(getStaffLandingPath({ isCompanyOwner: true, role: { permissions: ['*'] } }, '/jobs/123'), '/account');
});

test('wildcard staff cannot obtain SaaS wallet access', () => {
  const staff = { isCompanyOwner: false, role: { permissions: ['*'] } };
  assert.equal(hasPermission(staff, 'billing.view'), false);
  assert.equal(hasPermission(staff, 'billing.edit'), false);
  assert.notEqual(getStaffLandingPath(staff, '/account'), '/account');
});

test('effective server permissions take precedence over stale wildcard roles', () => {
  const staff = { isCompanyOwner: false, effectivePermissions: ['customers.view'], role: { permissions: ['*'] } };
  assert.equal(hasPermission(staff, 'jobs.view'), false);
  assert.equal(hasPermission(staff, 'customers.view'), true);
  assert.deepEqual(getUserPermissions(staff), ['customers.view']);
  assert.equal(getStaffLandingPath(staff, '/jobs'), '/customers');
  assert.equal(getStaffLandingPath({ ...staff, effectivePermissions: [] }), '/access-denied');
});
