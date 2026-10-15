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
  assert.match(panel, /bundle\.features\.map/);
  assert.match(panel, /bundle\.validUntil/);
  assert.match(panel, /!bundle\.meteredReady/);
});

test('UI informs users when metered backend events are not yet available', () => {
  assert.match(panel, /Per-use tracking must be connected to the selected backend actions/);
  assert.match(panel, /Only a company billing admin can purchase feature labels/);
  assert.match(panel, /Prepaid credits are not refunded/);
});
