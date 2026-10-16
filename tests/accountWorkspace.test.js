import test from 'node:test';
import assert from 'node:assert/strict';
import { isAccountOnly, setupRedirect } from '../src/utils/accountWorkspace.js';
const owner = { enforced:true, paidAccessRequired:true, modules:[], isCompanyOwner:true, unavailable:false };

test('unactivated owner can open account, own profile and shop details', () => {
  assert.equal(isAccountOnly(owner), true);
  for (const path of ['/account', '/account/', '/account/credits/buy', '/account/credits/features', '/account/credits/logs', '/profile', '/account/company', '/account/storage', '/account/storage/history']) {
    assert.equal(setupRedirect(owner, path), null, path);
  }
  for (const path of ['/dashboard', '/settings', '/jobs/123', '/staff-management/roles', '/account/templates', '/account/security', '/access-denied']) {
    assert.equal(setupRedirect(owner, path), '/account', path);
  }
});

test('unactivated staff get no SaaS account or profile escape route', () => {
  const staff = {...owner, isCompanyOwner:false};
  for (const path of ['/account', '/account/credits/buy', '/profile', '/dashboard', '/jobs']) {
    assert.equal(setupRedirect(staff, path), '/access-denied', path);
  }
  assert.equal(setupRedirect(staff, '/access-denied'), null);
});

test('activated modules return control to the normal role and feature guard', () => {
  const active = {...owner, modules:['jobs']};
  assert.equal(isAccountOnly(active), false);
  assert.equal(setupRedirect(active, '/jobs'), null);
  assert.equal(setupRedirect({...active, isCompanyOwner:false}, '/jobs'), null);
});

test('invalid or unavailable access does not become an authorized setup session', () => {
  assert.equal(isAccountOnly(null), false);
  assert.equal(isAccountOnly({...owner, unavailable:true}), false);
});
