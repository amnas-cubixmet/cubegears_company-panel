import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const text = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const checkout = text('../src/services/creditWallet.service.js');
const page = text('../src/pages/saas/CreditWorkspace.jsx');
const guard = text('../src/routes/ProtectedRoute.jsx');

test('credit checkout verifies captured payments without exposing secrets', () => {
  assert.match(checkout, /checkout\.razorpay\.com\/v1\/checkout\.js/);
  assert.match(checkout, /\/saas\/credits\/orders/);
  assert.match(checkout, /\/saas\/credits\/verify/);
  assert.match(checkout, /!confirmed\?\.credited/);
  assert.doesNotMatch(checkout, /KEY_SECRET|razorpay_secret/i);
});

test('company can open its dashboard without fixed subscription plan', () => {
  assert.doesNotMatch(guard, /billing\.required && !billing\.paid/);
  assert.match(guard, /hasPermission\(user, requiredPermission\)/);
});

test('wallet amount is always server-sourced and logs remain visible', () => {
  assert.match(page, /wallet\?\.balance/);
  assert.match(page, /creditWalletService\.logs/);
  assert.match(page, /feature\.perStaffCredits/);
  assert.doesNotMatch(page, /localStorage\.setItem/);
});
