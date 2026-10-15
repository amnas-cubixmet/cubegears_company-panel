import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const service = read('../src/services/creditWallet.service.js');
const page = read('../src/pages/saas/CreditWorkspace.jsx');

test('gateway status and read-only probe use the authenticated backend API', () => {
  assert.match(service, /gatewayStatus:.*saas\/credits\/gateway\/status/);
  assert.match(service, /testGateway:.*saas\/credits\/gateway\/test/);
  assert.doesNotMatch(service, /RAZORPAY_KEY_SECRET|RAZORPAY_WEBHOOK_SECRET/);
});

test('test connection UI is available only to billing admins on Buy Credits', () => {
  assert.match(page, /section !== 'buy' \|\| !wallet\?\.canManage/);
  assert.match(page, /wallet\?\.canManage && <div className="cg-credit-gateway"/);
  assert.match(page, /Test API Connection/);
  assert.match(page, /!gateway\?\.probeAvailable/);
});

test('connection status is not treated as a successful payment or wallet credit', () => {
  assert.match(page, /It does not create an order, debit money or add credits/);
  assert.match(service, /if \(!confirmed\?\.credited\)/);
  assert.match(service, /await creditWalletService\.verify\(payload\)/);
});
