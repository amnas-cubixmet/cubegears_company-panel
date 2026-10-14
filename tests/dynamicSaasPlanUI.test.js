import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const page = read('../src/pages/saas/PlanMarketplace.jsx');
const account = read('../src/pages/saas/SaaSAccount.jsx');
const routes = read('../src/routes/AppRoutes.jsx');
const service = read('../src/services/planCatalog.service.js');

test('workshop can compare plans and request monthly or yearly changes', () => {
  assert.match(page, /monthly/);
  assert.match(page, /yearly/);
  assert.match(page, /includedStorageGb/);
  assert.match(page, /maxBranches/);
  assert.match(page, /maxUsers/);
  assert.match(page, /requestChange/);
  assert.match(page, /Confirm Plan Request/);
});

test('custom enquiries are sent to backend and never activate plans immediately', () => {
  assert.match(page, /requestCustom/);
  assert.match(page, /Contact for Custom Plan/);
  assert.match(service, /apiClient.post\('\/saas\/billing\/change-requests'/);
  assert.match(service, /apiClient.post\('\/saas\/billing\/custom-requests'/);
  assert.doesNotMatch(service, /localStorage\.setItem/);
});

test('account uses plan comparison route and no longer advertises unlimited storage', () => {
  assert.match(routes, /\/account\/plans/);
  assert.match(account, /Compare \/ Change Plan/);
  assert.match(account, /includedStorageGb/);
  assert.match(account, /extraStorageRate/);
  assert.doesNotMatch(account, /Unlimited storage/);
});

test('all plans visibly retain GST invoice capability', () => {
  assert.match(page, /CGST, SGST and IGST/);
  assert.match(page, /GST \/ CGST \/ SGST \/ IGST billing included/);
});
