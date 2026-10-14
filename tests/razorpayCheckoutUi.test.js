import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const text = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const checkout = text('../src/services/razorpayCheckout.service.js');
const subscribe = text('../src/pages/saas/Subscribe.jsx');
const guard = text('../src/routes/ProtectedRoute.jsx');
const routes = text('../src/routes/AppRoutes.jsx');
const client = text('../src/api/apiClient.js');

test('checkout only submits server-created order and verifies Razorpay signature on backend', () => {
  assert.match(checkout, /\/saas\/checkout\/orders/);
  assert.match(checkout, /\/saas\/checkout\/verify/);
  assert.match(checkout, /checkout\.razorpay\.com\/v1\/checkout\.js/);
  assert.match(checkout, /order_id: order\.orderId/);
  assert.match(checkout, /handler: async \(payment\)/);
  assert.doesNotMatch(checkout, /KEY_SECRET|key_secret|razorpay_secret/i);
});

test('credit-based access removes subscription paywall from workspace routes', () => {
  assert.doesNotMatch(guard, /saas\/payments\/access|billing\.required/);
  assert.match(routes, /path="\/plans" element=\{<Navigate to="\/account\/credits\/buy" replace \/>\}/);
  assert.match(routes, /path="\/subscribe" element=\{<Navigate to="\/account\/credits\/buy" replace \/>\}/);
});

test('subscription pricing, expiry and account payment history are server driven', () => {
  assert.match(subscribe, /plan\.accessDurationDays/);
  assert.match(subscribe, /plan\.checkoutPrice/);
  assert.doesNotMatch(subscribe, /Monthly price|Yearly price/);
  assert.match(subscribe, /subscriptionApi\.order\(plan\.id\)/);
  assert.match(subscribe, /result\?\.payment\?\.status !== 'captured'/);
  assert.match(subscribe, /subscriptionApi\.history\(\)/);
  assert.match(subscribe, /UPI, cards and net banking/);
});

test('credit-based workspace no longer routes to subscription renewal on HTTP 402', () => {
  assert.doesNotMatch(client, /window\.location\.replace\('\/subscribe'\)/);
});
