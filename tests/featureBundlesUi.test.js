import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const service = read('../src/services/creditWallet.service.js');
const panel = read('../src/pages/saas/CreditWorkspace.jsx');

test('all paid bundle requests go through Django with server-calculated prices', () => {
  for (const endpoint of [
    '/saas/credits/bundles',
    '/saas/credits/bundles/purchase',
    '/saas/credits/bundles/disable',
  ]) assert.ok(service.includes(endpoint), endpoint);
  assert.match(service, /purchaseBundle: \(bundleId\)/);
  assert.doesNotMatch(service, /localStorage\.setItem|priceCredits: .*clientAmount/);
});

test('company can activate and disable real backend labels from Feature Controls', () => {
  assert.match(panel, /creditWalletService\.bundles\(\)/);
  assert.match(panel, /creditWalletService\.purchaseBundle\(bundle\.id\)/);
  assert.match(panel, /creditWalletService\.disableBundle\(bundle\.id\)/);
  assert.match(panel, /\(bundle\.features \|\| \[\]\)\.filter\(item => !freeKeys\.includes\(item\.key\)\)\.map/);
  assert.match(panel, /bundle\.validUntil/);
  assert.match(panel, /featureLabelStatus\(bundle, wallet\)/);
  assert.match(panel, /bundle\.perUserCredits/);
  assert.match(panel, /bundle\.totalCredits/);
  assert.doesNotMatch(panel, /bundle\.priceCredits/);
  assert.doesNotMatch(panel, /bundle\.activationCredits/);
});

test('UI informs users when metered backend events are not yet available', () => {
  const helper = read('../src/utils/featureActivation.js');
  assert.match(helper, /METERED_OPERATION_NOT_READY/);
  assert.match(helper, /FEATURE_ENTITLEMENTS_NOT_ENABLED/);
  assert.match(panel, /Only the company account owner can purchase module access/);
  assert.match(panel, /Prepaid credits are not refunded/);
});
